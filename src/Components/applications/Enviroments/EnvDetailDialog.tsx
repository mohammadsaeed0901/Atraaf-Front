import React from "react";
import IEnviroment from "../../../interfaces/Environment";
import {toLocalDate, getDateTooltip} from '../../sharedComponents/Utils';
import {Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, Tooltip} from '@mui/material';
import {Table, TableBody, TableCell, TableRow, TableHead} from '@mui/material';

type props = {
    handleClose: any,
    enviroment: IEnviroment
}

const columns = [
    {name: 'نام', align: 'right'},
    {name: 'کلید دسترسی', align: 'center'}, 
    {name: 'تاریخ ایجاد', align: 'right'}, 
];

const EnvDetailDialog = ({handleClose, enviroment}: props) => {
    return(
        <>
        <Dialog open={true} onClose={handleClose}>
            <DialogTitle color='primary'>اطلاعات محیط</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    <Table className="enviroment-detail-table">
                        <TableRow>
                            <TableCell align='right'>نام</TableCell>
                            <TableCell align='left' sx={{cursor: 'text'}}>{enviroment.name}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell align='right'>کلید دسترسی</TableCell>
                            <TableCell align='left' sx={{cursor: 'text'}}>{enviroment.accessKey}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell align='right'>تاریخ ایجاد</TableCell>
                            <TableCell align='left' sx={{cursor: 'text'}}>{getDateTooltip(enviroment.created)} - {toLocalDate(enviroment.created)}</TableCell>
                        </TableRow>
                    </Table>
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button color='secondary' variant="outlined" onClick={handleClose} disableElevation>بازگشت</Button>
            </DialogActions>
        </Dialog>
        </>
    );
}
export default EnvDetailDialog;