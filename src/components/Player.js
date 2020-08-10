import React, {useState} from "react";

import IconButton from "@material-ui/core/IconButton";
import PlayArrowIcon from '@material-ui/icons/PlayArrow';

import {SERVER} from '../constants';


export const Player = ({recordingId}) => {

  const [loaded, setLoaded] = useState(false)

  let jwt = JSON.parse(window.localStorage.getItem('auth')).jwt;
  if (typeof jwt !== "string") return false;

  return loaded
    ? <audio
      src={SERVER + '/records/' + recordingId + '?jwt=' + jwt}
      controls
      // crossOrigin="use-credentials"
    />
    : <IconButton onClick={() => setLoaded(true)}>
      <PlayArrowIcon/>
    </IconButton>
}
