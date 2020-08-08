import React, {useState} from "react";
import rest from "./Rest";

import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import IconButton from "@material-ui/core/IconButton";
import GetAppIcon from '@material-ui/icons/GetApp';


export const Player = props => {

  const [loading, setLoading] = useState(false);
  const [track, setTrack] = useState();

  const load = () => {

    setLoading(true)

    rest('records/' + props.recordingId)
      .then(res => {
        if (res.ok) {
          setTrack(res.body);
        }
        setLoading(false)
      })

  }

  const play = () => {
    return;
  }

  console.log('track', track)

  return track === undefined
    ? <IconButton
      disabled={loading}
      onClick={() => load()}
      >
      <GetAppIcon/>
      </IconButton>
    : <IconButton
      disabled={loading}
      onClick={() => play()}
    >
      <PlayArrowIcon/>
    </IconButton>
}
