const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const buildDir = path.join(rootDir, 'build');
const htaccessPath = path.join(rootDir, '.htaccess');
const buildHtaccessPath = path.join(buildDir, '.htaccess');

const remoteUser = process.env.DEPLOY_USER || 'u0087004';
const remoteHost = process.env.DEPLOY_HOST || 'uchet.store';
const remoteDir = process.env.DEPLOY_DIR || 'httpdocs/app.uchet.store';
const remote = `${remoteUser}@${remoteHost}`;
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

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

function deployArchive() {
    return new Promise((resolve, reject) => {
        const remoteCommand = [
            `rm -rf ${remoteDir}`,
            `mkdir -p ${remoteDir}`,
            `tar -xzf - -C ${remoteDir}`,
        ].join(' && ');

        const tar = spawn('tar', ['-czf', '-', '-C', buildDir, '.'], {
            cwd: rootDir,
            stdio: ['ignore', 'pipe', 'inherit'],
            shell: false,
        });

        const ssh = spawn('ssh', [remote, remoteCommand], {
            cwd: rootDir,
            stdio: ['pipe', 'inherit', 'inherit'],
            shell: false,
        });

        tar.stdout.pipe(ssh.stdin);

        tar.on('error', reject);
        ssh.on('error', reject);

        tar.on('close', code => {
            if (code !== 0) {
                ssh.stdin.end();
                reject(new Error(`tar failed with exit code ${code}`));
            }
        });

        ssh.on('close', code => {
            if (code === 0) {
                resolve();
                return;
            }

            reject(new Error(`ssh deploy failed with exit code ${code}`));
        });
    });
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
