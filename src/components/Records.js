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
import TextField from "@material-ui/core/TextField";

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

export const Records = () => {

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
                  <Player recordingId={v.recording_id}/>
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
