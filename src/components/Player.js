import React from "react";

import {SERVER} from '../constants';

export const Player = ({recordingId}) => {

  let jwt = JSON.parse(window.localStorage.getItem('auth')).jwt;
  if (typeof jwt !== "string") return false;

  return <>
    <audio
      src={SERVER + '/records/' + recordingId}
      controls
    />
    <audio
      src={SERVER + '/records/' + recordingId}
      controls
      crossOrigin="use-credentials"
    />
  </>
}
