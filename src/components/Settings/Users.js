import React, { useEffect, useMemo, useState } from "react";
import { connect } from "react-redux";

import TableHead from "@mui/material/TableHead";
import {
    Box,
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    IconButton,
    InputAdornment,
    MenuItem,
    Paper,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";

import TwoLineInCell from "../common/TwoLineInCell";
import { v4 as uuid } from "uuid";
import rest from "../Rest";

import { Link } from 'react-router-dom';
import { UiButton } from "../common/Ui";

const toLowerSafe = value => String(value || '').toLowerCase();

const POSITION_ACCESS_TITLE = '\u0414\u043e\u0441\u0442\u0443\u043f\u044b \u0434\u043e\u043b\u0436\u043d\u043e\u0441\u0442\u0435\u0439'
const POSITION_ACCESS_SUBTITLE = '\u041f\u043e\u043b\u043d\u043e\u043c\u043e\u0447\u0438\u044f \u0434\u043b\u044f \u043a\u0430\u0436\u0434\u043e\u0439 \u0440\u043e\u043b\u0438'
const PERMISSION_COLUMN_LABEL = '\u041f\u043e\u043b\u043d\u043e\u043c\u043e\u0447\u0438\u0435'
const ALLOWED_LABEL = '\u0420\u0430\u0437\u0440\u0435\u0448\u0435\u043d\u043e'
const DENIED_LABEL = '\u0417\u0430\u043f\u0440\u0435\u0449\u0435\u043d\u043e'
const EMPLOYEE_COLUMN_LABEL = '\u0421\u043e\u0442\u0440\u0443\u0434\u043d\u0438\u043a'
const POSITION_COLUMN_LABEL = '\u0414\u043e\u043b\u0436\u043d\u043e\u0441\u0442\u044c'
const STATUS_COLUMN_LABEL = '\u0421\u0442\u0430\u0442\u0443\u0441'
const INCLUDE_DISMISSED_LABEL = '\u0432\u043a\u043b\u044e\u0447\u0430\u044f \u0443\u0432\u043e\u043b\u0435\u043d\u043d\u044b\u0445'
const INVITE_USER_LABEL = '\u041f\u0440\u0438\u0433\u043b\u0430\u0441\u0438\u0442\u044c \u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044f'
const ACTIVE_USER_LABEL = '\u0420\u0430\u0431\u043e\u0442\u0430\u0435\u0442'
const DISMISSED_USER_LABEL = '\u0423\u0432\u043e\u043b\u0435\u043d'
const ADD_POSITION_LABEL = '\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u0434\u043e\u043b\u0436\u043d\u043e\u0441\u0442\u044c'
const EDIT_POSITION_LABEL = '\u0420\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u0434\u043e\u043b\u0436\u043d\u043e\u0441\u0442\u044c'
const POSITION_NAME_LABEL = '\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435'
const SAVE_LABEL = '\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c'
const CANCEL_LABEL = '\u041e\u0442\u043c\u0435\u043d\u0430'
const DELETE_LABEL = '\u0423\u0434\u0430\u043b\u0438\u0442\u044c'
const POSITION_DELETE_WARNING = '\u041d\u0435\u043b\u044c\u0437\u044f \u0443\u0434\u0430\u043b\u0438\u0442\u044c: \u0435\u0441\u0442\u044c \u0441\u043e\u0442\u0440\u0443\u0434\u043d\u0438\u043a\u0438 \u0441 \u044d\u0442\u043e\u0439 \u0434\u043e\u043b\u0436\u043d\u043e\u0441\u0442\u044c\u044e.'
const POSITION_DELETE_HINT = '\u0421\u043d\u0430\u0447\u0430\u043b\u0430 \u043f\u0435\u0440\u0435\u0432\u0435\u0434\u0438\u0442\u0435 \u0438\u0445 \u043d\u0430 \u0434\u0440\u0443\u0433\u0443\u044e \u0434\u043e\u043b\u0436\u043d\u043e\u0441\u0442\u044c.'

const parseMaybeJson = value => {
    if (!value || typeof value !== 'string') return value

    try {
        return JSON.parse(value)
    } catch (error) {
        return value
    }
}

const permissionLabelFromObject = (item, key) => {
    if (item?.label || item?.title) return item.label || item.title
    if (item?.name && String(item.name) !== String(key)) return item.name

    return item?.description || String(key)
}

const normalizePermissionDefinitions = descriptionTolerance => {
    const source = parseMaybeJson(descriptionTolerance)

    if (Array.isArray(source)) {
        return source
            .map(item => {
                if (typeof item === 'string') return { key: item, label: item, description: '' }

                const key = item?.key || item?.name || item?.code || item?.id
                if (!key) return null

                const label = permissionLabelFromObject(item, key)

                return {
                    key: String(key),
                    label,
                    description: item?.description && label !== item.description ? item.description : '',
                }
            })
            .filter(Boolean)
    }

    if (!source || typeof source !== 'object') return []

    return Object.entries(source).map(([key, value]) => {
        if (value && typeof value === 'object') {
            const label = permissionLabelFromObject(value, key)

            return {
                key,
                label,
                description: value.description && label !== value.description ? value.description : '',
            }
        }

        return {
            key,
            label: String(value || key),
            description: '',
        }
    })
}

const getPositionPermission = (position, key) => {
    const tolerance = parseMaybeJson(position?.tolerance)
        || parseMaybeJson(position?.permissions)
        || parseMaybeJson(position?.description_tolerance)
        || {}

    if (Object.prototype.hasOwnProperty.call(position || {}, key)) return Boolean(position[key])
    if (Object.prototype.hasOwnProperty.call(tolerance, key)) return Boolean(tolerance[key])

    return false
}

const Users = props => {

    const [isAll, setIsAll] = useState(false)
    const [search, setSearch] = useState('')
    const permissions = useMemo(
        () => normalizePermissionDefinitions(props.app.description_tolerance),
        [props.app.description_tolerance]
    )
    const [positionAccess, setPositionAccess] = useState({})
    const [savingAccess, setSavingAccess] = useState({})
    const [userPositionOverrides, setUserPositionOverrides] = useState({})
    const [savingUserPositions, setSavingUserPositions] = useState({})
    const [positionDialog, setPositionDialog] = useState(null)
    const [isSavingPositionDialog, setSavingPositionDialog] = useState(false)

    useEffect(() => {
        const nextAccess = {}

        ;(props.app.positions || []).forEach(position => {
            nextAccess[position.id] = {}

            permissions.forEach(permission => {
                nextAccess[position.id][permission.key] = getPositionPermission(position, permission.key)
            })
        })

        setPositionAccess(nextAccess)
    }, [permissions, props.app.positions])

    useEffect(() => {
        setUserPositionOverrides(prev => {
            const next = {}

            Object.keys(prev).forEach(userId => {
                const user = (props.app.users || []).find(item => String(item.id) === String(userId))

                if (user && String(user.position_id) !== String(prev[userId])) {
                    next[userId] = prev[userId]
                }
            })

            return next
        })
    }, [props.app.users])

    const validChange = userId => {

        const user = props.app.users.find(u => u.id === userId)

        if (!user) return

        rest('users/' + userId, user.is_valid ? 'DELETE' : 'POST')

    }

    const changeUserPosition = (user, value) => {
        const nextPositionId = Number.isNaN(Number(value)) ? value : Number(value)
        const previousPositionId = userPositionOverrides[user.id] ?? user.position_id

        if (String(previousPositionId) === String(nextPositionId)) return

        setSavingUserPositions(prev => ({ ...prev, [user.id]: true }))
        setUserPositionOverrides(prev => ({ ...prev, [user.id]: nextPositionId }))

        rest('users/' + user.id, 'PATCH', { position_id: nextPositionId })
            .then(res => {
                if (res?.ok) return

                setUserPositionOverrides(prev => ({
                    ...prev,
                    [user.id]: previousPositionId,
                }))
            })
            .finally(() => {
                setSavingUserPositions(prev => {
                    const next = { ...prev }
                    delete next[user.id]
                    return next
                })
            })
    }

    const changePositionAccess = (position, permissionKey, checked) => {
        const requestKey = position.id + ':' + permissionKey
        const prevValue = Boolean(positionAccess[position.id]?.[permissionKey])

        setSavingAccess(prev => ({ ...prev, [requestKey]: true }))
        setPositionAccess(prev => ({
            ...prev,
            [position.id]: {
                ...(prev[position.id] || {}),
                [permissionKey]: checked,
            },
        }))

        rest('positions/' + position.id, 'PATCH', { [permissionKey]: checked })
            .then(res => {
                if (res?.ok) return

                setPositionAccess(prev => ({
                    ...prev,
                    [position.id]: {
                        ...(prev[position.id] || {}),
                        [permissionKey]: prevValue,
                    },
                }))
            })
            .finally(() => {
                setSavingAccess(prev => {
                    const next = { ...prev }
                    delete next[requestKey]
                    return next
                })
            })
    }

    const openPositionDialog = (position = null) => {
        const nextPermissions = {}

        permissions.forEach(permission => {
            nextPermissions[permission.key] = position
                ? getPositionPermission(position, permission.key)
                : false
        })

        setPositionDialog({
            position,
            name: position?.name || '',
            permissions: nextPermissions,
        })
    }

    const closePositionDialog = () => {
        if (isSavingPositionDialog) return

        setPositionDialog(null)
    }

    const changeDialogPermission = (permissionKey, checked) => {
        setPositionDialog(prev => ({
            ...prev,
            permissions: {
                ...(prev?.permissions || {}),
                [permissionKey]: checked,
            },
        }))
    }

    const savePositionDialog = () => {
        if (!positionDialog || !positionDialog.name.trim()) return

        const payload = {
            name: positionDialog.name.trim(),
            ...positionDialog.permissions,
        }
        const isEdit = Boolean(positionDialog.position)
        const url = isEdit ? 'positions/' + positionDialog.position.id : 'positions'

        setSavingPositionDialog(true)

        rest(url, isEdit ? 'PATCH' : 'POST', payload)
            .then(res => {
                if (!res?.ok) return

                setPositionDialog(null)
            })
            .finally(() => {
                setSavingPositionDialog(false)
            })
    }

    const getPositionUsers = positionId => (props.app.users || [])
        .filter(user => String(user.position_id) === String(positionId))

    const deletePosition = () => {
        if (!positionDialog?.position) return
        if (getPositionUsers(positionDialog.position.id).length) return

        setSavingPositionDialog(true)

        rest('positions/' + positionDialog.position.id, 'DELETE')
            .then(res => {
                if (!res?.ok) return

                setPositionDialog(null)
            })
            .finally(() => {
                setSavingPositionDialog(false)
            })
    }

    const renderPositionDialog = () => {
        if (!positionDialog) return null

        const title = positionDialog.position ? EDIT_POSITION_LABEL : ADD_POSITION_LABEL
        const positionUsers = positionDialog.position
            ? getPositionUsers(positionDialog.position.id)
            : []
        const canDelete = Boolean(positionDialog.position) && !positionUsers.length

        return <Dialog
            open
            onClose={closePositionDialog}
            fullWidth
            maxWidth="sm"
        >
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, paddingTop: 1 }}>
                    <TextField
                        autoFocus
                        fullWidth
                        label={POSITION_NAME_LABEL}
                        value={positionDialog.name}
                        onChange={e => setPositionDialog(prev => ({ ...prev, name: e.target.value }))}
                    />
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: .5 }}>
                        {permissions.map(permission => <FormControlLabel
                            key={'position-dialog-permission-' + permission.key}
                            control={<Checkbox
                                checked={Boolean(positionDialog.permissions[permission.key])}
                                onChange={e => changeDialogPermission(permission.key, e.target.checked)}
                            />}
                            label={permission.description
                                ? TwoLineInCell(permission.label, permission.description)
                                : permission.label}
                        />)}
                    </Box>
                    {positionDialog.position && positionUsers.length > 0 && <Box sx={{
                        border: '1px solid rgba(211, 47, 47, 0.35)',
                        borderRadius: 1,
                        color: 'error.main',
                        padding: 1.25,
                    }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {POSITION_DELETE_WARNING}
                        </Typography>
                        <Typography variant="body2">
                            {POSITION_DELETE_HINT}
                        </Typography>
                        <Typography variant="body2" sx={{ marginTop: .5 }}>
                            {positionUsers.map(user => user.name).filter(Boolean).join(', ')}
                        </Typography>
                    </Box>}
                </Box>
            </DialogContent>
            <DialogActions>
                {positionDialog.position && <Button
                    color="error"
                    onClick={deletePosition}
                    disabled={isSavingPositionDialog || !canDelete}
                    sx={{ marginRight: 'auto' }}
                >
                    {DELETE_LABEL}
                </Button>}
                <Button onClick={closePositionDialog} disabled={isSavingPositionDialog}>
                    {CANCEL_LABEL}
                </Button>
                <Button
                    variant="contained"
                    onClick={savePositionDialog}
                    disabled={isSavingPositionDialog || !positionDialog.name.trim()}
                >
                    {SAVE_LABEL}
                </Button>
            </DialogActions>
        </Dialog>
    }

    const renderAccessMatrix = () => {
        const positions = props.app.positions || []

        if (!permissions.length) return null

        return <Box sx={{ margin: '.75rem .5rem 0' }}>
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 2,
                marginBottom: 1,
                flexWrap: 'wrap',
            }}>
                <Box>
                    <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 700 }}>
                        {POSITION_ACCESS_TITLE}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {POSITION_ACCESS_SUBTITLE}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Button
                        size="small"
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={() => openPositionDialog()}
                    >
                        {ADD_POSITION_LABEL}
                    </Button>
                </Box>
            </Box>

            <TableContainer component={Paper} elevation={0} sx={{
                border: '1px solid rgba(0, 0, 0, 0.08)',
                borderRadius: 2,
                overflowX: 'auto',
            }}>
                <Table size="small" stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{
                                minWidth: 260,
                                fontWeight: 700,
                                backgroundColor: 'var(--surface)',
                                position: 'sticky',
                                left: 0,
                                zIndex: 3,
                            }}>
                                {PERMISSION_COLUMN_LABEL}
                            </TableCell>
                            {positions.map(position => <TableCell
                                key={'position-head-' + position.id}
                                align="center"
                                sx={{ minWidth: 150, fontWeight: 700, backgroundColor: 'var(--surface)' }}
                            >
                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    gap: .5,
                                }}>
                                    <span>{position.name}</span>
                                    <Tooltip title={EDIT_POSITION_LABEL}>
                                        <IconButton
                                            size="small"
                                            onClick={() => openPositionDialog(position)}
                                        >
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </TableCell>)}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {permissions.map(permission => <TableRow
                            key={'permission-row-' + permission.key}
                            hover
                        >
                            <TableCell sx={{
                                backgroundColor: 'var(--surface)',
                                position: 'sticky',
                                left: 0,
                                zIndex: 2,
                            }}>
                                {TwoLineInCell(permission.label, permission.description)}
                            </TableCell>
                            {positions.map(position => {
                                const requestKey = position.id + ':' + permission.key
                                const checked = Boolean(positionAccess[position.id]?.[permission.key])

                                return <TableCell
                                    key={'position-access-' + position.id + '-' + permission.key}
                                    align="center"
                                >
                                    <Tooltip title={checked ? ALLOWED_LABEL : DENIED_LABEL}>
                                        <span>
                                            <Checkbox
                                                color="primary"
                                                checked={checked}
                                                disabled={Boolean(savingAccess[requestKey])}
                                                onChange={e => changePositionAccess(position, permission.key, e.target.checked)}
                                            />
                                        </span>
                                    </Tooltip>
                                </TableCell>
                            })}
                        </TableRow>)}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    }

    return <>

        <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-around',
            gap: '.75rem',
            margin: '.5rem',
        }}>

            <TextField
                autoFocus
                slotProps={{
                    input: {
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    },
                }}
                value={search}
                onChange={e => setSearch(e.target.value)}
            />

            <FormControlLabel control={

                <Switch checked={isAll}
                    color="primary"
                    onChange={() => setIsAll(!isAll)}
                />
            }
                label={INCLUDE_DISMISSED_LABEL}
            />

            <Link to={"/settings/invites"}>
                <UiButton
                    className="btn-l"
                    block
                    color="mdb-color"
                >
                    {INVITE_USER_LABEL}
                </UiButton>
            </Link>


        </div >

        <Table size="small"
            style={{ background: 'var(--surface)' }}
        >
            <TableHead>
                <TableRow>
                    <TableCell>{EMPLOYEE_COLUMN_LABEL}</TableCell>
                    <TableCell>{POSITION_COLUMN_LABEL}</TableCell>
                    <TableCell>{STATUS_COLUMN_LABEL}</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {props.app.users
                    .filter(u => u.is_valid || isAll)
                    .filter(u => {

                        if (!search) return true

                        const name = toLowerSafe(u.name)
                        const email = toLowerSafe(u.email)
                        const pn = toLowerSafe(u.phone_number)

                        let r = true

                        search.toLowerCase()
                            .split(' ')
                            .map(u => {

                                if (name.indexOf(u) < 0 && email.indexOf(u) < 0 && pn.indexOf(u) < 0) {
                                    r = false
                                }

                                return u

                            })

                        return r

                    })
                    .map(u => {

                        const positions = props.app.positions || []
                        const currentPositionId = userPositionOverrides[u.id] ?? u.position_id
                        const position = positions.find(p => String(p.id) === String(currentPositionId))

                        return <TableRow key={uuid()}
                        >
                            <TableCell>
                                {TwoLineInCell(u.name, [u.phone_number, u.email].filter(Boolean).join(' / '))}
                            </TableCell>
                            <TableCell>
                                <TextField
                                    select
                                    size="small"
                                    value={currentPositionId || ''}
                                    disabled={Boolean(savingUserPositions[u.id]) || !positions.length}
                                    onChange={e => changeUserPosition(u, e.target.value)}
                                    sx={{ minWidth: 220, maxWidth: 280 }}
                                >
                                    {positions.map(position => (
                                        <MenuItem key={'user-position-' + u.id + '-' + position.id} value={position.id}>
                                            {position.name}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </TableCell>
                            <TableCell>
                                <FormControlLabel
                                    label={u.is_valid ? ACTIVE_USER_LABEL : DISMISSED_USER_LABEL}
                                    control={
                                        <Switch checked={u.is_valid}
                                            color="primary"
                                            onChange={() => validChange(u.id)}
                                        />}
                                />
                            </TableCell>
                        </TableRow>
                    })}

            </TableBody>
        </Table>

        {renderAccessMatrix()}
        {renderPositionDialog()}
    </>
}

export default connect(state => state)(Users);
