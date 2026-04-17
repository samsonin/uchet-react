import React, {useState} from "react";

import Grid from "@mui/material/Grid";
import TableContainer from "@mui/material/TableContainer";
import {Paper} from "@mui/material";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Typography from "@mui/material/Typography";
import Input from "@mui/material/Input";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from '@mui/icons-material/Search';
import TableBody from "@mui/material/TableBody";
import LinearProgress from "@mui/material/LinearProgress";

import rest from "./Rest";
import {Player} from "./Player";
import TextField from "@mui/material/TextField";

let request = false;
let searchPhone = false;

const getStr = int => {
  return (int < 10
    ? '0'
    : '') + int
}

const getTime = timestamp => {

  let d = new Date(timestamp * 1000);

  let month = getStr(d.getMonth() + 1);
  let date = getStr(d.getDate());
  let h = getStr(d.getHours());
  let m = getStr(d.getMinutes());

  return d.getFullYear() + '-' + month + '-' + date + ' ' + h + ':' + m
}

const getUrl = (searchDate, searchPhone) => {

  let url = 'records?'
  if (searchDate) url = url + 'date=' + searchDate + '&'
  if (searchPhone) url = url + 'phone_number=' + searchPhone + '&'

  return url;

}

let dateObj = new Date();
let month = getStr(dateObj.getMonth() + 1)
let date = getStr(dateObj.getDate())

let searchDate = dateObj.getFullYear() + '-' + month + '-' + date

export const Records = props => {

  const [data, setData] = useState()

  const handleSearch = value => {

    if (value.date !== undefined) searchDate = value.date
    if (value.phone !== undefined) searchPhone = value.phone

    if (!request) {
      request = true;

      let url = getUrl(searchDate, searchPhone);

      rest(url)
        .then(res => {
          request = false;

          if (res.ok) setData(res.status === 200
            ? res.body
            : null);

          if (url !== getUrl(searchDate, searchPhone)) {
            handleSearch({
              date: searchDate,
              phone: searchPhone,
            })
          }

        })

    }
  }

  if (!request && data === undefined) handleSearch({date: searchDate});

  return <Grid container>
    <Grid item>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell style={{weight: '40%'}}>
                <Typography variant="h5">
                  <TextField
                    type="date"
                    defaultValue={searchDate}
                    onChange={e => handleSearch({date: e.target.value})}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Typography>
              </TableCell>
              <TableCell colSpan={2}>
                <Input
                  onChange={e => handleSearch({phone: e.target.value})}
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
                  <Player recordingId={v.recording_id} orgId={props.orgId} sign={v.sign} />
                </TableCell>
              </TableRow>)
              : <TableRow>
                <TableCell colSpan={3} style={{textAlign: 'center'}}>
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
