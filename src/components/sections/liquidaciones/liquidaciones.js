import React from 'react';
import { Divider, Row, Col, Input, Modal, AutoComplete, DatePicker, Empty, notification, Pagination } from 'antd';
import { PlusOutlined, LoadingOutlined, CheckCircleOutlined, AlertOutlined, InfoCircleOutlined } from '@ant-design/icons';
import esES from 'antd/lib/locale/es_ES';
import LiqCard from './liq-card.js'
import Axios from 'axios';

const { RangePicker } = DatePicker;
const moment = require('moment');
const { Search } = Input;
const dateFormat = 'YYYY-MM-DD';
const mesesNombres = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

var liq = [], liqFilter = [];
var ucds = [];
var lastInfo = new FormData();

var maxItems = 0;
const maxRows = 5;
var rowOffset = 0;

const getTitle = (ucdId, fecha) => {

    const f = fecha.split('-');
    var n = ucds[ucds.findIndex(v => v.id == ucdId)];

    n = n ? n.value.split(" ") : "[Eliminado]";

    var t = n==="[Eliminado]" ? "[Beneficiario Borrado]" : n[n.length -1] + ", " + n[0];
    t += " - " + f[0] + " de " + mesesNombres[parseInt(f[1] - 1, 10)];
    
    return t;
}

const renderItem = (title, dni) => {
    return {
      value: title,
      label: (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          {title}
          <span style={{color: "gray", fontSize: 12}}>
            <InfoCircleOutlined />{dni.toString().substr(-3, 3)}
          </span>
        </div>
      ),
    };
  };

class Liquidaciones extends React.Component {

    state = { 
        visible: false,
        isLoading: true,
        id: 0,
        cantidad: 0,
        benefIndex: -1
    };

    abortController = new AbortController();

    getData = async () => {
        try{  
            const result = await fetch('http://localhost:4000/getLiq/Id', {signal: this.abortController.signal});
            const data = await result.json();
            maxItems = data.length;

            const res = await fetch('http://localhost:4000/getLiq/*' + '/' + maxRows + '/' + rowOffset, {signal: this.abortController.signal});
            const datos = await res.json();
            if (datos) {
                liq = datos;
            }
            
            liqFilter = liq;


            this.setState({cantidad: liqFilter.length})
        }catch(e){
            liq = [];
            console.log(e);
        }
    }
    
    getBenef = async () => {
        try{            
            const resBenef = await fetch('http://localhost:4000/getBenef/' + "Nombre,Apellido,DNI,Id", {signal: this.abortController.signal});
            const datosBenef = await resBenef.json();
            if(datosBenef)
                ucds = (datosBenef.map(p => ({
                    value: p.Nombre + " " + p.Apellido,
                    dni: p.DNI,
                    key: p.Id, 
                    id: p.Id
                })));          
        }catch(e){
            ucds = [];
            console.log(e);
        }
    }

    cargarTodo = () =>{
        window.scrollTo(0,0)
        this.getBenef().then(
            () => this.getData().then(
                () => this.setState({isLoading: false})))
    }

    componentDidMount(){
        this.cargarTodo();
    }

    componentWillUnmount(){
        rowOffset = 0;
        this.abortController.abort();
    }

    //Mostrar modal
    showModal = () => {     
        this.setState({
        visible: true,
        id: 0,
        benefIndex: -1
        });
    };

    //maneja boton ok del modal
    handleOk = e => {
        let f = new Date();
        let d = String(f.getDate()).padStart(2,0);
        let m = String(f.getMonth() + 1).padStart(2,0);
        let a = f.getFullYear();
        let fecha = `${d}/${m}/${a}`;
        lastInfo.set("FechaEmision", fecha)

        console.log(lastInfo.get("Desde"),lastInfo.get("Hasta"))
        if(this.state.id <=0){
            Axios.post('http://localhost:4000/addLiq', lastInfo, {
                    headers: {
                        Accept: 'application/json'
                    }
                }).then(() => {this.setState({
                    visible: false,
                    })
                    this.cargarTodo();
                    this.openNotification(
                        "Agregado Exitoso",
                        "La Liquidación fue creada correctamente",
                        true
                    )
            }, () => {this.openNotification("Error",
            "Hay campos sin rellenar", false)});
        }
        else{
            console.log(lastInfo.get("IdBeneficiario"))
            Axios.post('http://localhost:4000/updLiq/' + this.state.id, lastInfo, {
                    headers: {
                        Accept: 'application/json'
                    }
                }).then(() => {this.setState({
                    visible: false
                    })
                    this.cargarTodo();
                    this.openNotification(
                        "Modificacion Exitosa",
                        "La Liquidación fue modificada correctamente",
                        true
                    )
            }, () => {this.openNotification("Error",
            "Hay campos sin rellenar", false)});
        }
    };

    //cancelar modal
    handleCancel = e => {
        Modal.confirm({
            title:'¿Desea cerrar el formulario?',
            content: 'Se perderán los cambios no guardados',
            okText: 'Si', cancelText: 'No',
            onOk:(()=>{this.setState({visible: false, id:0})})
        })
    };


    onEdit = (id) => {
        this.setState({
            id: id, 
            visible: true
        })

        let array = liq;
        let index = array.findIndex(p => p.Id == id);
        for (var prop in array[index]) {
            lastInfo.set(prop, array[index][prop]);
        }
        this.setState({benefIndex: ucds.findIndex(v => v.id == lastInfo.get("IdBeneficiario"))});
    }

    onDelete = (id) => {
        Modal.confirm({
            title:'¿Realmente desea eliminar este elemento?',
            content: 'Esta acción no se puede deshacer.',
            okText: 'Si', cancelText: 'No',
            onOk:(()=>{
                Axios.delete('http://localhost:4000/liq/' + id).then(() => {
                this.openNotification(
                    "Eliminación exitosa",
                    "La Liquidación se borró correctamente",
                    true
                )
                this.getData();
                });
            })
        })
    }


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

    //Buscador
    handleSearch = async(v) => {
        if(v !== null && v !== ""){
            let pattern = v.replace(/^\s+/g, '');
            let column = "Nombre,Apellido";
            let k = v.split(':');
            if(k.length > 1){
                column = k[0];
                pattern = k[1].replace(/^\s+/g, '');
            }
            try{
                const result = await fetch('http://localhost:4000/find/Id/Beneficiario/' + column + '/' + pattern, {signal: this.abortController.signal});
                const data = await result.json();
                if(data.error)
                    this.openNotification('Error de busqueda', `"${column}" no es un criterio de busqueda valido`, false);
                else{
                    var arr = [];
                    var p = new Promise((resolve, reject) => data.forEach(async(info) => {
                        let idType = "Beneficiario=" + info.Id;
                        const result2 = await fetch('http://localhost:4000/getLiqPorID/*/' + idType, {signal: this.abortController.signal});
                        const data2 = await result2.json();
                        if(!data2.error){
                            arr = Array.prototype.concat(arr, data2);
                            resolve();
                        }
                    }));
                    p.then(()=> {
                        arr = arr.filter (function (value, index, array) { 
                            return array.indexOf (value) == index;
                        });
                        liqFilter = arr;
                        this.setState({cantidad: liqFilter.length});
                    });
                }
            }
            catch(e){console.log(e);}
        } else liqFilter = liq;
        this.setState({cantidad: liqFilter.length});
    } 
    
    onChangeFilter = async(e) => {
        if(e){
            let desde = e[0].format(dateFormat);
            let hasta = e[1].format(dateFormat);
            let fields = "*";
            const res = await fetch('http://localhost:4000/rangoLiq/' + fields + '/' + desde + '/' + hasta);
            const datos = await res.json();
            if(!datos.error)
                liqFilter = datos;
        }
        else liqFilter = liq;

        this.setState({cantidad: liqFilter.length});
    }

    // onChangeInput = (e) => {
    //     lastInfo.set(e.target.id, e.target.value);
    // }


    arrayEquals(a, b) {
        return Array.isArray(a) &&
          Array.isArray(b) &&
          a.length === b.length &&
          a.every((val, index) => val === b[index]);
    }

    render(){
        return(
            <div className="content-cont prot-shadow">
                <Row>
                    <Col span={18}>
                        <Divider orientation="left" plain>
                            <h1 className="big-title">
                                Liquidaciones
                            </h1>
                        </Divider>
                        <div className="range-wrap">
                            <h3 className="data-attr">Filtrar por fecha del periodo: </h3>
                            <RangePicker
                                size="small"
                                format="DD/MM/YYYY"
                                separator=">"
                                allowClear
                                locale={esES}
                                onChange={this.onChangeFilter}
                            />
                        </div>
                        <div className="cards-container">
                            <Empty style={{display: this.state.isLoading ? "none" : liq.length > 0 ? "none" : "inline"}} description={false} />
                            {liqFilter.map(v =>
                                <LiqCard
                                    OnEdit={this.onEdit}
                                    OnDelete={this.onDelete}
                                    title={getTitle(v.IdBeneficiario, v.Desde)}
                                    idbenef={v.IdBeneficiario}
                                    desde={moment(v.Desde, dateFormat).format("DD/MM/YYYY")}
                                    hasta={moment(v.Hasta, dateFormat).format("DD/MM/YYYY")}
                                    fecha={v.FechaEmision}
                                    key={v.Id}
                                    id={v.Id}
                                    linkto="/liq-preview"
                                />
                            )}
                            <LoadingOutlined style={{ padding: 16, fontSize: 24, display: this.state.isLoading ? "inline" : "none" }} spin />
                        </div>
                        <Pagination 
                            style={{textAlign:"center", visibility:maxItems<=maxRows||!this.arrayEquals(liq,liqFilter)?"hidden":"visible"}} 
                            defaultCurrent={1} 
                            total={maxItems} 
                            pageSize={maxRows}
                            onChange={(page)=>{rowOffset=maxRows*(page-1); this.cargarTodo();}}
                        />
                    </Col>
                    <Col span={6}>
                        <Search placeholder="Buscar..." style={{width: '95%', margin: 8, marginRight: 16}} onSearch={value => this.handleSearch(value)} allowClear={true}/>
                        <div className="right-menu">
                            <div className="right-btn" onClick={this.showModal}>
                                <PlusOutlined />
                                <span className="right-btn-text">Nuevo</span>
                            </div>
                        </div>
                    </Col>
                </Row>
                <Modal
                    title={this.state.id <=0 ? "Nueva Liquidación" : "Modificar Liquidación"}
                    visible={this.state.visible}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                    cancelText="Cancelar"
                    okText={this.state.id <=0?"Generar":"Modificar"}
                    destroyOnClose
                    style={{padding: 16}}
                >
                    <div style={{padding:16}}>
                        <Row justify="space-between">
                            <Col span={24}>
                                <h4>Beneficiario</h4>
                                <AutoComplete
                                    style={{ width: '100%' }}
                                    options={ucds.map(i => renderItem(i.value, i.dni))}
                                    placeholder="Nombre"
                                    filterOption={(inputValue, option) =>
                                        option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                                    }
                                    onChange = {(e, value, reason) => {
                                        if(e === undefined) return;
                                        var prop = ucds.find(v => v.value == e);
                                        if(prop)
                                            lastInfo.set("IdBeneficiario",prop.id);
                                    }}
                                    defaultValue={this.state.id <=0 ? this.value : this.state.benefIndex > -1 ? ucds[this.state.benefIndex].value : "[Beneficiario Borrado]"}
                                    allowClear
                                />
                            </Col>
                        </Row>
                        <Row justify="space-between">
                            <Col span={11}>
                                <h4 style={{marginTop: 24}}>Desde</h4>
                                <DatePicker 
                                    placeholder="Fecha" 
                                    style={{width: '100%'}} 
                                    format={"DD/MM/YYYY"}
                                    onChange={(e) => lastInfo.set("Desde", e.format(dateFormat))}
                                    defaultValue={this.state.id <= 0 ? this.value : moment(lastInfo.get("Desde"), "DD/MM/YYYY")}
                                    allowClear={false}
                                />
                            </Col>
                            <Col span={11}>
                                <h4 style={{marginTop: 24}}>Hasta</h4>
                                <DatePicker 
                                    placeholder="Fecha" 
                                    style={{width: '100%'}}
                                    format={"DD/MM/YYYY"}
                                    onChange={(e) => lastInfo.set("Hasta", e.format(dateFormat))}
                                    defaultValue={this.state.id <=0 ? this.value : moment(lastInfo.get("Hasta"), "DD/MM/YYYY")}
                                    allowClear={false}
                                />
                            </Col>
                        </Row>
                    </div>
                </Modal>
                
            </div>
        )
    }
}

export default Liquidaciones