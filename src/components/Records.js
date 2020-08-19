import React, {useState} from "react";

import Grid from "@material-ui/core/Grid";
import TableContainer from "@material-ui/core/TableContainer";
import {Paper} from "@material-ui/core";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell/TableCell";
import Typography from "@material-ui/core/Typography";
import Input from "@material-ui/core/Input/Input";
import InputAdornment from "@material-ui/core/InputAdornment";
import SearchIcon from '@material-ui/icons/Search';
import TableBody from "@material-ui/core/TableBody";
import LinearProgress from "@material-ui/core/LinearProgress";

import rest from "./Rest";
import {Player} from "./Player";

let request = false;
let searchStr = false;

export const Records = () => {

  const [data, setData] = useState()

  const getTime = timestamp => {

    let d = new Date(timestamp * 1000);

    let h = d.getHours();
    if (h < 10) h = '0' + h;

    let m = d.getMinutes();
    if (m < 10) m = '0' + m;

    return d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate() + ' ' + h + ':' + m
  }

  const handleSearch = value => {

    searchStr = value;

    if (!request) {
      request = true;

      let url = value === ''
        ? 'records'
        : 'records?phone_number=' + value

      rest(url)
        .then(res => {
          request = false;

          if (res.ok) setData(res.status === 200
            ? res.body
            : null);

          if (searchStr !== value) {

            console.log('searchStr', searchStr)
            console.log('value', value)

            handleSearch(searchStr)
          }

        })

    }
  }

  if (!request && data === undefined) handleSearch('');

  return <Grid conteiner>
    <Grid item>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell style={{weight: '40%'}}>
                <Typography variant="h5">
                  Записи разговоров
                </Typography>
              </TableCell>
              <TableCell colSpan={2}>
                <Input
                  onChange={e => handleSearch(e.target.value)}
                  endAdornment={
                    <InputAdornment position="end">
                      <SearchIcon/>
                    </InputAdornment>
                  }/>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Дата, время</TableCell>
              <TableCell>Номер телефона</TableCell>
              <TableCell>Запись</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>

            {data
              ? data.map(v => <TableRow key={'tablerowkeyaudrecs' + v.recording_id}>
                <TableCell>{getTime(v.created_at)}</TableCell>
                <TableCell>{v.phone_number}</TableCell>
                <TableCell>
                  <Player recordingId={v.recording_id}/>
                </TableCell>
              </TableRow>)
              : <TableRow>
                <TableCell colSpan={3}>
                  {data === undefined
                    ? <LinearProgress/>
                    : 'Нет данных'}
                </TableCell>
              </TableRow>
            }

          </TableBody>
        </Table>
      </TableContainer>

    </ Grid>
  </Grid>

}
