import React,{ useState, useEffect } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { Row, Col, Menu, Dropdown } from 'antd';
import { EllipsisOutlined, EditFilled, DeleteFilled } from '@ant-design/icons';
import LiqImg from '../../../images/image6.png'
import '../../layout/cards.css'
import Axios from 'axios';
import { createHashHistory } from 'history';
// import { format } from 'sequelize/types/lib/utils';
export const history = createHashHistory();


const dateFormat = 'DD/MM/YYYY';
const moment = require('moment');

function LiqCard(props) {
    
    var datos;
    const getDatos = async () =>{
        const res = await fetch('http://localhost:4000/acompOnly/' + props.id);
        datos = await res.json();
    }


    const getJor4Liq = async () => {

        const desde = moment(props.desde, dateFormat).format("YYYY-MM-DD")
        const hasta = moment(props.hasta, dateFormat).format("YYYY-MM-DD")
        let jornadas
        let totalhoras = 0

        try{
            const res = await fetch('http://localhost:4000/getJor4Liq/' + props.idbenef + '/' + desde + '/' + hasta, 
            // {signal: this.abortController.signal}
            );
            jornadas = await res.json();
            console.log(jornadas)
        }catch(e){
            console.log("MAL ", e)
        }

        jornadas.map(j => {
            console.log(j.CantHoras)
            totalhoras = totalhoras + j.CantHoras
        })

        console.log("Horas totales del ciclo: " + totalhoras)
    }
    
    const titleClick = () => {
        getJor4Liq()
    }

    const dropClick = ({ key }) => {
        //Key de <Menu.Item>
        if (key === 'edit') {
            props.OnEdit(props.id);
        } else {
            props.OnDelete(props.id)
        }
    }
    
    const menu = (
        <Menu onClick={dropClick}>
            {/* la key es como se diferencian las opciones del drop, en la funcion dropClick*/}
            <Menu.Item key="edit"> 
                <div className="drop-btn">
                    <EditFilled />
                    <p>Editar</p>
                </div>
            </Menu.Item>
            <Menu.Item key="delete">
                <div className="drop-btn" style={{color: "red"}}>
                    <DeleteFilled />
                    <p>Eliminar</p>
                </div>
            </Menu.Item>
        </Menu>
    );

    return(
        <div className="card">
            <div className="card-row">
                <div className="card-left-col">
                    <img src={LiqImg} alt="" style={{width: '70%'}}/>
                </div>
                <div className="card-mid-col">
                    <Row>
                        <div className="card-title-container">
                            <h1 className="name-title" onClick={titleClick}>
                                {props.title}
                            </h1>
                            {/* <h3 className="card-subtitle">
                                UDC Asignada: {props.ucd.Nombre + " " + props.ucd.Apellido}
                            </h3> */}
                        </div>
                    </Row>
                        <div className="card-contents">
                            <h3 className="card-subtitle">desde: {props.desde}</h3>
                            <h3 className="card-subtitle">hasta: {props.hasta}</h3>
                        </div>
                </div>
                <div className="card-right-col">
                    <Dropdown overlay={menu} trigger={['click']} placement="bottomRight">
                        <EllipsisOutlined style={{fontSize: 20, color: '#9EA2A7'}}/>
                    </Dropdown>
                    <h4 className="card-subtitle">
                    {/* ids: {this.props.id}  */}
                    {props.fecha}
                    </h4>
                </div>
            </div>
        </div>
    )
}


export default withRouter(LiqCard)