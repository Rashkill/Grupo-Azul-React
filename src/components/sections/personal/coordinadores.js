import React,{ useState } from 'react';
import { Divider, Row, Col, Input, Modal, Form } from 'antd';
import { PlusOutlined, FileDoneOutlined } from '@ant-design/icons';
// import CoordCard from './coord-card.js';

const { Search } = Input;

var lastInfo = {
    Nombre: "",
    Apellido: "",
    PrecioMensual: 0
}

function Coordinadores() {
    const [state, setState] = useState({    //Estados
        visible : false
    });

    const showModal = () => {     //Mostrar modal
        setState({
        visible: true,
        });
    };
    const handleOk = e => {       //maneja boton ok del modal
        console.log(e);
        setState({
        visible: false,
        });
    };
    const handleCancel = e => {   //cancelar modal
        var confirm = window.confirm('¿Desea cerrar el formulario? Se perderán los cambios no guardados')
        if(confirm){
            setState({visible: false})
        }
    };
    const handleSearch = (v) => { //Presionar enter al buscador
        console.log(v)
    }
    
    const form = Form.useForm();
    const onChangeInput = (e) =>{}

    return(
        <div className="content-cont">
            <Row>
                <Col span={18}>
                    <Divider orientation="left" plain>
                        <h1 className="big-title">
                            Coordinadores
                        </h1>
                    </Divider>
                </Col>
                <Col span={6}>
                    <Search placeholder="Buscar..." style={{width: '95%', margin: 8, marginRight: 16}} onSearch={value => this.handleSearch(value)} allowClear={true}/>
                    <div className="right-menu">
                        <div className="right-btn" onClick={showModal}>
                            <PlusOutlined />
                            <span className="right-btn-text">Nuevo</span>
                        </div>
                        <div className="right-btn">
                            <FileDoneOutlined />
                            <span className="right-btn-text">Monotributo</span>
                        </div>
                    </div>
                </Col>
            </Row>


            <Modal
                title="Nuevo Coordinador"
                visible={state.visible}
                onOk={handleOk}
                onCancel={handleCancel}
                cancelText="Cancelar"
                okText="Ok"
            >
                culo
                {/* <Form form={form}>
                    <Row gutter={[48,20]}>
                    <Col span={12}>
                        <Divider orientation="left">Datos Principales</Divider>
                    </Col>
                    <Col span={12}>
                        <Divider orientation="left">Datos de Contacto</Divider>
                    </Col>
                        <Col span={12}>
                            <Input placeholder="Nombre" id="nombre" value={lastInfo.Nombre} onChange={onChangeInput} />
                        </Col>

                        <Col span={12}>

                            <Input placeholder="Apellido" id="apellido" value={lastInfo.Apellido} onChange={onChangeInput}/>
                        </Col>

                        <Col span={12}>
                        <Input placeholder="Precio Mensual" type="number" id="precioMensual" value={lastInfo.PrecioMensual} onChange={onChangeInput}/>
                        </Col>
                    </Row>
                </Form> */}
            </Modal>
            
        </div>
    )
    
}

export default Coordinadores