import React from 'react';
import { Divider, Row, Col, Input, Modal, AutoComplete, DatePicker, notification , Empty } from 'antd';
import { PlusOutlined, FileDoneOutlined, LoadingOutlined , UploadOutlined, CheckCircleOutlined, AlertOutlined } from '@ant-design/icons';
import JornadaCard from './jornada-card';
import axios from 'axios';


const { Search } = Input;
const { RangePicker } = DatePicker;
const dateFormat = 'DD/MM/YYYY';
const mesesNombres = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];
const moment = require('moment');
const { confirm } = Modal;

var agds = [];
var ucds = [];

function nombreJornada (agdID, ucdID, fecha)
{
    if (ucds.length > 0) {
        const f = fecha.split('/');
        const n1 = ucds[ucdID - 1].value.split(" ");
        const n2 = agds[agdID - 1].value.split(" ");
        var n = f[0] + " de " + mesesNombres[parseInt(f[1] - 1, 10)];
        n += " / " + n1[n1.length -1] + " - " + n2[n2.length -1];
        return n;
    }
    
}

function getNombreAgd(id)
{
    return agds[id - 1].value;
}

function getNombreUcd(id)
{
    return ucds[id - 1].value;
}

var jornadasIn = []

var lastInfo = {
    IdBeneficiario: 0,
    IdAcompañante: 0,
    CantHoras: 0,
    FechaIngreso: "",
    FechaEgreso: "",
    rangeVal: undefined
}


const abortController = new AbortController();

const getData = async () => {
    try{
        const res = await fetch('http://localhost:4000/getAcomp', {signal: abortController.signal});
        const datosAcomp = await res.json();
        if(datosAcomp)
            agds = (datosAcomp.map(p => ({value: p.Nombre + " " + p.Apellido, key: p.Id})));
        
        const resBenef = await fetch('http://localhost:4000/getBenef', {signal: abortController.signal});
        const datosBenef = await resBenef.json();
        if(datosBenef.data)
            ucds = (datosBenef.data.map(p => ({value: p.Nombre + " " + p.Apellido, key: p.Id})));
        
        
    }catch(e){console.log(e)}
}

//const loadingIcon = <LoadingOutlined style={{ fontSize: 24, display: this.state.isLoading ? "inline" : "none" }} spin />;

class Jornadas extends React.Component{
    state = { 
        visible: false,
        isLoading: true,
        horas: 0,
        jornadas: jornadasIn
    };

    
    componentDidMount(){
        this.cargarTodo();
    }
    componentWillUnmount(){
        abortController.abort();
    }
    cargarTodo = () =>
    {
        getData().then(async() =>{
            const res = await fetch('http://localhost:4000/getJornadas');
            const datos = await res.json();

            const jornadasInfoArray = (datos.map(j => ({
                title: nombreJornada(j.IdBeneficiario, j.IdAcompañante, j.FechaIngreso),
                IdBeneficiario: j.IdBeneficiario,
                agds: agds,
                IdAcompañante: j.IdAcompañante,
                ucds: ucds,
                CantHoras: j.CantHoras,
                FechaIngreso: j.FechaIngreso,
                FechaEgreso: j.FechaEgreso,
                rangeVal: [moment(j.FechaIngreso, dateFormat+ " HH:mm"), moment(j.FechaEgreso, dateFormat+ " HH:mm")],
                key: j.Id
            }), this));
            jornadasIn = jornadasInfoArray;
            this.setState({isLoading: false, jornadas: jornadasInfoArray});
        });
    }

    rangeOk = (value) => {
        //calculo de horas
        if(value[0] !== null && value[1] !== null)
        {
            lastInfo.rangeVal = value;
            var mins = value[1] - value[0]
            mins = mins / 1000 / 60
            mins = Math.round(mins)
            var hs = mins / 60
            if(hs > 0)
                this.setState({horas: hs});

            //lastInfo.title = value[0]._d.getDate() + " de " + mesesNombres[value[0]._d.getMonth()];
            lastInfo.FechaIngreso = value[0].format(dateFormat + " HH:mm");
            lastInfo.FechaEgreso = value[1].format(dateFormat + " HH:mm");
        }
    }

    //Mostrar modal
    showModal = () => {     
        this.setState({
        visible: true
        });
    };

    //maneja boton ok del modal
    handleOk = e => {
        if(lastInfo.IdBeneficiario > 0 && lastInfo.IdAcompañante > 0 &&
            lastInfo.rangeVal[0] !== null && lastInfo.rangeVal[1] !== null) {
        
            this.setState({
            visible: false,
            });

            if(this.state.horas > 0)
                lastInfo.CantHoras = this.state.horas;

            axios.post('http://localhost:4000/addJornada', lastInfo)
            .then(() => {
                this.openNotification("Agregado exitoso",
                "La jornada fue creada correctamente", true);
                lastInfo = 
                {
                    IdBeneficiario: 0,
                    IdAcompañante: 0,
                    CantHoras: 0,
                    FechaIngreso: "",
                    FechaEgreso: "",
                    rangeVal: undefined
                }
                this.cargarTodo();
            });
        }
        else
            this.openNotification("Datos invalidos",
            "No se pueden dejar campos vacios", false);
    };

    openNotification = (msg, desc, succeed) => {
        this.setState({
            editVisible: false,
        });

        notification.open({
            message: msg,
            description: desc,
            icon: succeed ? 
            <CheckCircleOutlined style={{ color: '#52C41A' }} /> : 
            <AlertOutlined style={{ color: '#c4251a' }} />
        });
    };

    //cerrar modal
    handleCancel = e => {
        this.setState({visible: false})
    }
    
    //Presionar enter al buscador
    handleSearch = (v) => { 
    }

    render(){
        return(
            <div className="content-cont prot-shadow">
                <Row>
                    <Col span={18}>
                        <Divider orientation="left" plain>
                            <h1 className="big-title">
                                Jornadas
                            </h1>
                        </Divider>
                        
                        <div className="cards-container">
                            <Empty style={{display: this.state.isLoading ? "none" : jornadasIn.length > 0 ? "none" : "inline"}} description={false} />
                            {this.state.jornadas.map(jornadaInfo => {
                                return(
                                    <JornadaCard
                                        title={jornadaInfo.title}
                                        agdID={jornadaInfo.IdBeneficiario}
                                        ucdID={jornadaInfo.IdAcompañante}
                                        horas={jornadaInfo.CantHoras}
                                        ingreso={jornadaInfo.FechaIngreso}
                                        egreso={jornadaInfo.FechaEgreso}
                                        id={jornadaInfo.key}
                                        rangeVal={jornadaInfo.rangeVal}
                                        key={jornadaInfo.key}
                                        ucds={jornadaInfo.ucds}
                                        agds={jornadaInfo.agds}
                                        Refresh={this.cargarTodo}
                                    />
                                )
                            })}
                            <LoadingOutlined style={{ padding: 16, fontSize: 24, display: this.state.isLoading ? "inline" : "none" }} spin />
                        </div>

                    </Col>
                    <Col span={6}>
                        <Search placeholder="Buscar..." style={{width: '95%', margin: 8, marginRight: 16}} onSearch={value => this.handleSearch(value)} allowClear={true}/>
                        <div className="right-menu">
                            <div className="right-btn" hidden={this.state.isLoading} onClick={this.showModal}>
                                <PlusOutlined />
                                <span className="right-btn-text">Nuevo</span>
                            </div>
                        </div>
                    </Col>
                </Row>


                <Modal
                    title="Nueva Jornada"
                    visible={this.state.visible}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                    cancelText="Cancelar"
                    okText="Aceptar"
                    destroyOnClose
                    style={{padding: 16}}
                >
                    <div style={{padding:16}}>
                        <Row justify="space-between">
                            <Col span={11}>
                                <h4>Beneficiario</h4>
                                <AutoComplete
                                    style={{ width: '100%' }}
                                    options={ucds}
                                    placeholder="Nombre"
                                    filterOption={(inputValue, option) =>
                                        option.value.toUpperCase().indexOf(inputValue.toUpperCase()) + 1 !== 0
                                    }
                                    onChange = {(e, value, reason) => {
                                        if(e === undefined) return;
                                        var id = ucds.findIndex(v => v.value == e);
                                        if(id !== -1)
                                            lastInfo.IdAcompañante = id+1;
                                    }}
                                    defaultValue={lastInfo.IdAcompañante > 0 ? ucds[lastInfo.IdAcompañante - 1].value : this.value}
                                    allowClear
                                />
                            </Col>

                            <Col span={11}>
                                <h4>Acompañante</h4>
                                <AutoComplete
                                    style={{ width: '100%' }}
                                    options={agds}
                                    placeholder="Nombre"
                                    filterOption={(inputValue, option) =>
                                        option.value.toUpperCase().indexOf(inputValue.toUpperCase()) + 1 !== 0
                                    }
                                    onChange = {(e, value, reason) => {
                                        if(e === undefined) return;
                                        var id = agds.findIndex(v => v.value == e);
                                        if(id !== -1)
                                            lastInfo.IdBeneficiario = id+1;
                                    }}
                                    defaultValue={lastInfo.IdBeneficiario > 0 ? agds[lastInfo.IdBeneficiario - 1].value : this.value}
                                    allowClear
                                />
                            </Col>

                        </Row>

                        <Row>
                            <Col span={24}>
                                <h4 style={{marginTop: 24}}>Ingreso y Egreso</h4>
                                <RangePicker 
                                    showTime={{ format: 'HH:mm' }} 
                                    format="DD / MM / YYYY HH:mm"
                                    onOk={this.rangeOk}
                                    minuteStep={30}
                                    placeholder={['Desde', 'Hasta']}
                                    style={{width: '100%'}}
                                    value={lastInfo.rangeVal !== undefined ? lastInfo.rangeVal : this.value}
                                    allowClear
                                />
                            </Col>
                            <p className='card-subtitle' style={{marginTop: 8}}>Horas cumplidas: {this.state.horas}</p>
                        </Row>
                    </div>

                </Modal>
                
            </div>
        )
    }
}

export default Jornadas