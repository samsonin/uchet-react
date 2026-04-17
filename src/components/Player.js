import React, {useState} from "react";

import IconButton from "@mui/material/IconButton";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

import {SERVER} from '../constants';


export const Player = ({recordingId, orgId, sign}) => {

    const [loaded, setLoaded] = useState(false)

    let jwt = JSON.parse(window.localStorage.getItem('auth')).jwt;
    if (typeof jwt !== "string") return false;

    return loaded
        ? <audio
            controls
            src={SERVER + '/records/' + recordingId + '/' + orgId + '/' + sign}
        />
        : <IconButton onClick={() => setLoaded(true)}>
            <PlayArrowIcon/>
        </IconButton>
}
