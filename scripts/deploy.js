const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream/promises');

const rootDir = path.resolve(__dirname, '..');
const buildDir = path.join(rootDir, 'build');
const htaccessPath = path.join(rootDir, '.htaccess');
const buildHtaccessPath = path.join(buildDir, '.htaccess');

const remoteUser = process.env.DEPLOY_USER || 'u0087004';
const remoteHost = process.env.DEPLOY_HOST || 'uchet.store';
const remoteDir = process.env.DEPLOY_DIR || 'httpdocs/app.uchet.store';
const remote = `${remoteUser}@${remoteHost}`;
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const tarCommand = process.env.DEPLOY_TAR_COMMAND || 'tar';
const sshCommand = process.env.DEPLOY_SSH_COMMAND || 'ssh';
const deployTimeoutMs = Number(process.env.DEPLOY_TIMEOUT_MS || 120000);

function run(command, args, options = {}) {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, {
            cwd: rootDir,
            stdio: 'inherit',
            shell: false,
            ...options,
        });

        child.on('error', reject);
        child.on('close', code => {
            if (code === 0) {
                resolve();
                return;
            }

            reject(new Error(`${command} ${args.join(' ')} failed with exit code ${code}`));
        });
    });
}

function copyHtaccess() {
    if (!fs.existsSync(htaccessPath)) {
        throw new Error(`Cannot find ${htaccessPath}`);
    }

    if (!fs.existsSync(buildDir)) {
        throw new Error(`Cannot find ${buildDir}`);
    }

    fs.copyFileSync(htaccessPath, buildHtaccessPath);
    console.log(`Copied .htaccess to ${buildHtaccessPath}`);
}

function shellEscape(value) {
    return `'${String(value).replace(/'/g, `'\\''`)}'`;
}

function getTarEnv() {
    return process.platform === 'darwin'
        ? { ...process.env, COPYFILE_DISABLE: '1' }
        : { ...process.env };
}

function getSshArgs(remoteCommand) {
    const args = [
        '-o', 'BatchMode=yes',
        '-o', 'ConnectTimeout=20',
        '-o', 'ServerAliveInterval=15',
        '-o', 'ServerAliveCountMax=4',
        remote,
        remoteCommand,
    ];

    return args;
}

function waitForExit(child, label) {
    return new Promise((resolve, reject) => {
        child.on('error', error => reject(new Error(`${label} failed to start: ${error.message}`)));
        child.on('close', code => {
            if (code === 0) {
                resolve();
                return;
            }

            reject(new Error(`${label} failed with exit code ${code}`));
        });
    });
}

async function deployArchive() {
    const remotePath = shellEscape(remoteDir);
    const remoteCommand = [
        `rm -rf ${remotePath}`,
        `mkdir -p ${remotePath}`,
        `tar -xzf - -C ${remotePath}`,
    ].join(' && ');

    const tar = spawn(tarCommand, ['-czf', '-', '-C', buildDir, '.'], {
        cwd: rootDir,
        env: getTarEnv(),
        stdio: ['ignore', 'pipe', 'inherit'],
        shell: false,
    });

    const ssh = spawn(sshCommand, getSshArgs(remoteCommand), {
        cwd: rootDir,
        stdio: ['pipe', 'inherit', 'inherit'],
        shell: false,
    });

    const timeout = setTimeout(() => {
        tar.kill('SIGTERM');
        ssh.kill('SIGTERM');
    }, deployTimeoutMs);

    try {
        await Promise.all([
            pipeline(tar.stdout, ssh.stdin),
            waitForExit(tar, tarCommand),
            waitForExit(ssh, sshCommand),
        ]);
    } catch (error) {
        if (!tar.killed) tar.kill('SIGTERM');
        if (!ssh.killed) ssh.kill('SIGTERM');

        if (String(error.message || '').includes('exit code null')) {
            throw new Error(`deploy timed out after ${deployTimeoutMs}ms`);
        }

        throw error;
    } finally {
        clearTimeout(timeout);
    }
}

async function main() {
    console.log('Building project...');
    await run(npmCommand, ['run', 'build']);

    copyHtaccess();

    console.log(`Deploying build to ${remote}:${remoteDir}...`);
    await deployArchive();

    console.log('Deploy complete.');
}

main().catch(error => {
    console.error(error.message);
    process.exit(1);
});
