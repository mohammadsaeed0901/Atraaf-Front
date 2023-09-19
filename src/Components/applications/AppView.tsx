import React, { useEffect } from 'react';
//impoort hooks
import {useParams} from "react-router-dom";
import useGetAppById from '../../services/Applications/useGetAppById';
import useCreateEnviroment from '../../services/Enviroments/useCreateEnviroment';
import useDeleteEnviroment from '../../services/Enviroments/useDeleteEnviroment';
import useCreateParameter from '../../services/Parameters/useCreateParameter';
import useGetEnviromentParameters from '../../services/Parameters/useGetEviromentParameters' ;
import useDeleteParameter from '../../services/Parameters/useDeleteParameter';
import useEditParameters from '../../services/Parameters/useEditParameter';
import IEnviroment from 'interfaces/Environment';
import AddEnvDialog from './Enviroments/AddEnvDialog';
import EnvDetailDialog from './Enviroments/EnvDetailDialog';
import DeleteDialog from './DeleteDialog';
import AddParameterDialog from './Enviroments/AddParameterDialog';
import {tableTheme} from './assets/style/tableTheme';
import ParamTableHeaderCell from './ParamTableHeaderCell';

//import material components
import {Box, Typography, Button, IconButton, Tooltip, TextField} from '@mui/material';
import {TableContainer, Table, TableHead, TableBody, TableRow, TableCell, TablePagination, Grid} from '@mui/material';
import {Add} from '@mui/icons-material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckIcon from '@mui/icons-material/CheckCircle';
import { ThemeProvider} from '@mui/material/styles';

const AppView = () => {
    let { appId } = useParams();
    //hooks
    const getAppHook = useGetAppById(appId!);
    const createEnviromentHook = useCreateEnviroment();
    const deleteEnviromentHook = useDeleteEnviroment();
    const createParameterHook = useCreateParameter();
    const deleteParameterHook = useDeleteParameter();
    const editParameterHook = useEditParameters();
    
    let environments: IEnviroment[] = [];
    if(getAppHook.data && getAppHook.data?.environments){
        environments = getAppHook.data.environments;
    }
    const getEnviromentParametersHook = useGetEnviromentParameters(appId!, environments);
    
    //states
    const [openAddEnvDialog, setOpenAddEnvDialog] = React.useState(false);
    const [openAddParamDialog, setOpenAddParamDialog] = React.useState(false);
    const [openShowEnvDialog, setOpenShowEnvDialog] = React.useState(false);
    const [openDeleteEnvDialog, setOpenDeleteEnvDialog] = React.useState(false);
    const [openParamDelete, setOpenParamDelete] = React.useState(false);
    const [selectedEnv, setSelectedEnv] = React.useState<IEnviroment>();
    const [selectedParam, setSelectedParam] = React.useState<string>();
    const [editableRow, setEditableRow] = React.useState('');
    const [onForkEnv, setOnForkEnv] = React.useState(-1);
    const [envValues, setEnvValues] = React.useState<{[key: number]:any}>();

    //create parameters table
    const getRows = () => {
        let params: string[] = [];
        getEnviromentParametersHook.map((environmentParams)=>{
            for(const param in environmentParams.data){
                if(params.indexOf(param) === -1)
                    params.push(param)
            }
        })
        return params;
    }

    //enviroments functions
    const onEnviromentCreate = async(name:string) =>{
        try{
            await createEnviromentHook.mutateAsync({
                name: name,
                id: appId!
            })
            // await getAppHook.refetch();
            if(onForkEnv !== -1){
                const index = getAppHook?.data?.environments?.findIndex(object => {
                    return object.id === onForkEnv;
                });
                let keys: string[] = [];
                let values: string[] = [];
                let globals: boolean[] = [];
                Object.keys(getEnviromentParametersHook[index!].data).map((key)=>{
                    keys.push(key);
                    values.push(getEnviromentParametersHook[index!].data[key]);
                    globals.push(false);
                })
                let id =(await getAppHook.refetch()).data?.environments!.at(-1)?.id;
                onParamCreate(keys, values, globals, appId!, id!);
                setOnForkEnv(-1);
            }
            else{
                await getAppHook.refetch();
            }
        }
        catch{}
    }

    const onShowEnvDetail = (enviroment: IEnviroment) => {
        setSelectedEnv(enviroment);
        setOpenShowEnvDialog(true);
    }
    
    const onEnvDeleteButtonClicked = (enviroment: IEnviroment) =>{
        setSelectedEnv(enviroment);
        setOpenDeleteEnvDialog(true);
    }

    const onEnviromentDelete = async (envId: number|string) => {
        try{
            await deleteEnviromentHook.mutateAsync({
                appId: appId!,
                envId: envId
            })
            await getAppHook.refetch()
        }
        catch{}
    }

    const handleCloseEnvDeleteDialog = (operation:string) =>{
        if(operation === 'delete'){
            onEnviromentDelete(selectedEnv?.id!);
        }
        setOpenDeleteEnvDialog(false);
    }

    //params
    const onParamCreate = async(key: string[], value: string[], global: boolean[], appId: string, envId: number) =>{
        try{
            await createParameterHook.mutateAsync({
                key: key,
                value: value,
                global: global,
                appId: appId,
                envId: envId
            })
            await getAppHook.refetch()
            getEnviromentParametersHook.forEach((item)=>{
                item.refetch()
            })
        }
        catch{}
    }

    const onParamDeleteBtnClicked = (name: string) => {
        setOpenParamDelete(true);
        setSelectedParam(name);
    }

    const onParamDelete = async(paramName: string) => {
        try{
            await deleteParameterHook.mutateAsync({
                name: paramName,
                appId: appId!,
            })
            await getAppHook.refetch();
            getEnviromentParametersHook.forEach(hook=> hook.refetch())
        }
        catch{}
    }
    const handleCloseParamDeleteDialog = (operation:string) =>{
        if(operation === 'delete'){
            onParamDelete(selectedParam!);
        }
        setOpenParamDelete(false);
    }

    const onEditParam = async () => {
        setEditableRow('');
        console.log(envValues, editableRow);
        try{
            if(envValues != undefined){
                await editParameterHook.mutateAsync({
                    name: editableRow,
                    envValues: envValues,
                    appId: appId!
                })
                await getAppHook.refetch();
                getEnviromentParametersHook.forEach(hook=> hook.refetch())
            }
        }
        catch{} 
    }

    let tableRows = getRows();
    return (
        <>
                <Grid container sx={{justifyContent: 'center', mt:5}}>
                    <Grid item md={9} className='application-root-header-box'>
                        <Box>
                            <Typography variant='h1' color="primary">برنامه {getAppHook.data?.name}</Typography>
                        </Box>
                        <Box>
                            <Button variant='contained' size="small" id="addBtn" sx={{mx:1}} onClick={()=>setOpenAddParamDialog(true)}>
                                <Add fontSize='small'/>
                                افزودن پارامتر
                            </Button>
                            <Button variant='contained' size="small" id="addBtn" sx={{mx:1}} onClick={()=>setOpenAddEnvDialog(true)}>
                                <Add fontSize='small'/>
                                افزودن محیط
                            </Button>
                        </Box>
                    </Grid>
                    <Grid item md={9}>
                    <ThemeProvider theme={tableTheme}>
                    <TableContainer sx={{minWidth: '700px', maxHeight: 400, direction: 'ltr'}}>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell align='left' className='sticky-table-cell head-cell'>parameters</TableCell>
                                {getAppHook?.data?.environments!.map((environment, index)=>{
                                    return(
                                        <ParamTableHeaderCell 
                                        key={index} 
                                        enviroment={environment} 
                                        onShowEnvDetail={onShowEnvDetail} 
                                        openForkDialog = {setOpenAddEnvDialog}
                                        setOnForkEnv = {setOnForkEnv}
                                        onDeleteButtonClicked={onEnvDeleteButtonClicked}/>
                                    )
                                })
                                }
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {
                                    tableRows.map((row)=>{
                                        return(
                                            <TableRow hover>
                                                <TableCell align='left' className='sticky-table-cell'>
                                                    <Box 
                                                    sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%'}}>
                                                        {row.length < 10 ? row : `${row.substring(0, 7)}...`}
                                                        <Box sx={{display: 'flex'}}>
                                                            {
                                                            editableRow === row?
                                                            <IconButton onClick={()=>{
                                                                setEditableRow('');
                                                                setEnvValues({});
                                                            }}>
                                                            <CancelIcon fontSize='small' color='error'/>
                                                            </IconButton>
                                                            :
                                                            <Tooltip title='Delete parameter'>
                                                                <IconButton onClick={()=>onParamDeleteBtnClicked(row)}>
                                                                <DeleteIcon fontSize='small' sx={{color:'#6AA4B0'}}/>
                                                                </IconButton>
                                                            </Tooltip>
                                                            }
                                                            {
                                                            editableRow === row?
                                                            <IconButton onClick={onEditParam}>
                                                            <CheckIcon fontSize='small' color='success'/>
                                                            </IconButton>
                                                            :
                                                            <Tooltip title='Edit parameter'>
                                                                <IconButton onClick={()=>setEditableRow(row)}>
                                                                <EditIcon fontSize='small' sx={{color:'#6AA4B0'}}/>
                                                                </IconButton>
                                                            </Tooltip>
                                                            }                                                           
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                                {
                                                    getEnviromentParametersHook.map((params, index)=>{
                                                        return(
                                                            <TableCell align='center' sx={{wordWrap: 'break-word'}}>
                                                                {
                                                                    editableRow===row?
                                                                    <TextField 
                                                                    defaultValue={params?.data? params?.data[row] : ''}
                                                                    variant='standard'
                                                                    onChange={(e)=>{
                                                                        let temp:{[key:number]:any} = {...envValues};
                                                                        let enviromentId = getAppHook.data?.environments!.at(index)?.id;
                                                                        temp[enviromentId!] = e.target.value;
                                                                        setEnvValues(temp);
                                                                    }}
                                                                    sx={{width: '100%'}}/>
                                                                    : (params?.data? params?.data[row] : null)
                                                                }
                                                            </TableCell>
                                                        );
                                                    })
                                                }
                                            </TableRow>
                                        );
                                    })
                                }
                            </TableBody>
                        </Table>
                    </TableContainer>
                    </ThemeProvider>
                    </Grid>
                </Grid>
            {openAddEnvDialog? <AddEnvDialog handleClose={()=>setOpenAddEnvDialog(false)} onEnvCreate={($name)=>onEnviromentCreate($name)}/> : null}
            {openShowEnvDialog? <EnvDetailDialog handleClose={()=>setOpenShowEnvDialog(false)} enviroment={selectedEnv!}/> : null}
            {openDeleteEnvDialog? 
            <DeleteDialog handleClose={($event:string)=>handleCloseEnvDeleteDialog($event)} massage= {`آیا از حذف محیط با نام ${selectedEnv?.name} مطمئن هستید؟`}/>
            : null}
            {openAddParamDialog? 
            <AddParameterDialog
            enviroments={getAppHook.data?.environments!} 
            handleClose={()=>setOpenAddParamDialog(false)}
            onParameterCreate={(key, value, global, envId)=>{onParamCreate(key, value, global, appId!, envId)}}/> 
            : null}
            {openParamDelete? 
            <DeleteDialog 
            handleClose={($operation:string)=> handleCloseParamDeleteDialog($operation)} massage={`آیا از حذف پارامتر  ${selectedParam} در همه محیط ها مطمئن هستید؟`}/>
            : null}
        </>
    );
}
export default AppView;