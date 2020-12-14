import React from 'react'
import {Divider} from 'antd'
import { NavLink, withRouter } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, MapConsumer } from 'react-leaflet'
import { Typography, Space } from 'antd';
import { createHashHistory } from 'history';
import { marker } from 'leaflet';
import markerGreen from '../../../images/marker-icon-green.png'
import markerBlue from '../../../images/marker-icon-blue.png'
import markerYellow from '../../../images/marker-icon-yellow.png'
import markerGrey from '../../../images/marker-icon-grey.png'
import markerShadow from '../../../images/marker-shadow.png'

const { Text } = Typography;

export const history = createHashHistory();

var L = window.L;
var markerIcon;
let group;

class Map extends React.Component {
 
    state = {
        info: [],
        linkto: "",
        mainMarkerIcon: new L.Icon({
            iconUrl: markerGrey,
            shadowUrl: markerShadow,
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        })
    }

    componentDidMount = async() =>{
        if(this.props.buscarCoords){
            try {
                let fields = "*";
                switch(this.props.buscarCoords){
                    case "Acompañante": 
                        fields = "Id, Nombre, Apellido, DNI, CUIL, EntidadBancaria, CBU, Domicilio, Localidad, CodigoPostal, Email, Telefono, ValorHora, NumeroPoliza, NombreSeguros, Latitud, Longitud"
                        markerIcon = new L.Icon({
                            iconUrl: markerBlue,
                            shadowUrl: markerShadow,
                            iconSize: [25, 41],
                            iconAnchor: [12, 41],
                            popupAnchor: [1, -34],
                            shadowSize: [41, 41]
                        });
                        this.setState({linkto:"/acompprofile"}); 
                        break;
                    case "Beneficiario":
                        fields = "Id, Nombre, Apellido, DNI, CUIL, FechaNacimiento, Domicilio, Localidad, CodigoPostal, Email, Telefono, Enfermedades, IdCoordinador, Latitud, Longitud"
                        markerIcon = new L.Icon({
                            iconUrl: markerGreen,
                            shadowUrl: markerShadow,
                            iconSize: [25, 41],
                            iconAnchor: [12, 41],
                            popupAnchor: [1, -34],
                            shadowSize: [41, 41]
                        });
                        this.setState({linkto:"/benefprofile"}); 
                        break;
                    case "Coordinador": 
                        fields = "Id, Nombre, Apellido, DNI, CUIL, EntidadBancaria, CBU, Domicilio, Localidad, CodigoPostal, ValorMes, Latitud, Longitud"
                        markerIcon = new L.Icon({
                            iconUrl: markerYellow,
                            shadowUrl: markerShadow,
                            iconSize: [25, 41],
                            iconAnchor: [12, 41],
                            popupAnchor: [1, -34],
                            shadowSize: [41, 41]
                        });
                        this.setState({linkto:"/coordprofile"}); 
                        break;
                }

                const result = await fetch('http://localhost:4000/getTable/' + fields + "/" + this.props.buscarCoords);
                const info = await result.json();
                this.setState({info: await info})
                let coords = [];
                info.map((i) => {
                    coords.push([i.Latitud, i.Longitud])
                })
                group = new L.featureGroup(coords);
                console.log(coords)
            } catch (error) {console.log(error);}
        }

        //Color del marker principal
        switch(this.props.markerPrincipal){
            case "Acompañante": 
                this.setState(
                    {
                        mainMarkerIcon: new L.Icon({
                            iconUrl: markerBlue,
                            shadowUrl: markerShadow,
                            iconSize: [25, 41],
                            iconAnchor: [12, 41],
                            popupAnchor: [1, -34],
                            shadowSize: [41, 41]
                    })
                })
                break;
            case "Beneficiario":
                this.setState(
                    {
                        mainMarkerIcon: new L.Icon({
                            iconUrl: markerGreen,
                            shadowUrl: markerShadow,
                            iconSize: [25, 41],
                            iconAnchor: [12, 41],
                            popupAnchor: [1, -34],
                            shadowSize: [41, 41]
                    })
                })
                break;
            case "Coordinador": 
                this.setState(
                    {
                        mainMarkerIcon: new L.Icon({
                            iconUrl: markerYellow,
                            shadowUrl: markerShadow,
                            iconSize: [25, 41],
                            iconAnchor: [12, 41],
                            popupAnchor: [1, -34],
                            shadowSize: [41, 41]
                    })
                })
                break;
        }
        
    }

    render(){
        return(
            <div id="mapid" style={{width: '100%', height: '100%'}}>
                <MapContainer center={this.props.coordPrincipal} zoom={16} scrollWheelZoom={true} style={{height:'100%'}} ref={(ref) => { this.map = ref; }}>
                    <MapConsumer>
                        {(map) => {
                        // console.log('map center:', map.fitBounds(group.getBounds()))
                        return null
                        }}
                    </MapConsumer>
                    <TileLayer
                        // attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker
                        icon ={this.state.mainMarkerIcon}
                        position={this.props.coordPrincipal}
                    >
                    </Marker>

                    {this.state.info.map((p,index) => {
                        
                        return(
                            <Marker 
                                icon={markerIcon}
                                position={[p.Latitud, p.Longitud]} 
                                key={`Marker N°${index+1}`}
                            >
                                <Popup>
                                    <Divider>
                                        <Text mark>{this.props.buscarCoords}</Text><br/>
                                        <NavLink style={{fontWeight: "bolder"}} to={{
                                            pathname: this.state.linkto,
                                            state: p
                                        }}>
                                            {p.Nombre + " " + p.Apellido}
                                        </NavLink>
                                        <br/>
                                        <p style={{fontSize: 12, margin: 0}}>
                                            {p.CUIL}
                                        </p>
                                    </Divider>
                                    <div style={{textAlign: "center"}}>
                                        {p.Domicilio} <br/>
                                        <div style={{fontSize: 10}}>{p.Localidad + " " + p.CodigoPostal}</div>
                                    </div>
                                </Popup>
                            </Marker>
                        )
                    })}
                </MapContainer>
            </div>
        )
    }

}


export default Map