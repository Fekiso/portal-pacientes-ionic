import React, { useEffect, useState } from "react";
import { useHistory } from "react-router";
import axios from "axios";
import dayjs from "dayjs";
import "dayjs/locale/es";
import {
  IonAccordion,
  IonAccordionGroup,
  IonButton,
  IonCol,
  IonGrid,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonRow,
} from "@ionic/react";

import { close, closeOutline } from "ionicons/icons";
import "./TurnosPaciente.css";
import CustomDesplegable from "../../components/CustomDesplegable/CustomDesplegable";

export default function TurnosPaciente() {
  const [usuario, setUsuario] = useState({});
  const [cargando, setCargando] = useState(false);
  const [urlAxio, setUrlAxio] = useState("");
  const [tituloPagina, setTituloPagina] = useState("");
  const [especialidades, setEspecialidades] = useState([]);
  const [prestadores, setPrestadores] = useState([]);
  const [listadoPrestadores, setListadoPrestadores] = useState([]);
  const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState(-1);
  const [prestadorSeleccionado, setPrestadorSeleccionado] = useState(-1);
  const [filtroCancelados, setFiltroCancelados] = useState(-1);
  const [filtroAsistidos, setFiltroAsistidos] = useState(-1);
  const [listadoTurnos, setListadoTurnos] = useState([]);
  const [listadoTurnosFiltrados, setListadoTurnosFiltrados] = useState([]);
  const [cancelados, setCancelados] = useState([
    { codigo: true, text: "Cancelados" },
    { codigo: false, text: "No cancelados" },
  ]);
  const [asistidos, setAsistidos] = useState([
    { codigo: false, text: "No asistidos" },
    { codigo: true, text: "Asistidos" },
  ]);
  const history = useHistory();

  const traerTurnosPaciente = async (paciente) => {
    let turnos = null;
    const url = localStorage.getItem("urlAxio");
    const config = {
      headers: { Authorization: `Bearer ${paciente.token}` },
    };

    try {
      const servicio = await axios
        .get(`${url}Servicios`, config)
        .then((response) => {
          if (response.data.length !== 0) {
            return response.data;
          } else {
            return null;
          }
        });
      if (servicio !== null) {
        const response = await axios.get(
          `${url}Turnos/TurnosPaciente/?paciente=${paciente.codigo}&servicio=${servicio[0].codigo}`,
          config
        );
        if (response.data.length !== 0) {
          turnos = response.data;
        } else {
          turnos = null;
        }
        setListadoTurnos(turnos);
      }
    } catch (e) {
      console.log("Error");
      console.log(e.response);
    }
    setCargando(false);
  };

  const traerEspecialidades = async (paciente) => {
    let especialidades = null;
    const url = localStorage.getItem("urlAxio");
    const config = {
      headers: { Authorization: `Bearer ${paciente.token}` },
    };

    try {
      const response = await axios.get(`${url}Especialidades`, config);
      if (response.data.length !== 0) {
        especialidades = response.data;
      } else {
        especialidades = null;
      }

      especialidades = especialidades.filter(
        (especialidad) => especialidad.vigente === true
      );

      especialidades = especialidades.map((especialidad) => {
        return {
          ...especialidad,
          text: especialidad.nombre,
        };
      });

      setEspecialidades(especialidades);
    } catch (e) {
      console.log("Error");
      console.log(e.response);
    }
    setCargando(false);
  };

  const traerPrestadores = async (paciente) => {
    let prestadores = null;
    const url = localStorage.getItem("urlAxio");
    const config = {
      headers: { Authorization: `Bearer ${paciente.token}` },
    };

    try {
      const response = await axios.get(`${url}Prestadores`, config);
      if (response.data.length !== 0) {
        prestadores = response.data;
      } else {
        prestadores = null;
      }

      prestadores = prestadores.filter(
        (prestador) => prestador.vigente === true
      );

      prestadores = prestadores.map((prestador) => {
        return {
          ...prestador,
          text: prestador.nombre,
        };
      });

      setPrestadores(prestadores);
      setListadoPrestadores(prestadores);
    } catch (e) {
      console.log("Error");
      console.log(e.response);
    }
    setCargando(false);
  };

  useEffect(() => {
    try {
      const sesion = JSON.parse(sessionStorage.getItem("ppUL"));
      if (sesion !== {}) {
        traerTurnosPaciente(sesion);
        traerPrestadores(sesion);
        traerEspecialidades(sesion);
        setUsuario(sesion);
        setUrlAxio(localStorage.getItem("urlAxio"));
        setTituloPagina(localStorage.getItem("nombreClinica"));
        document.title = localStorage.getItem("tituloWeb");
      }
    } catch (e) {
      history.push({ pathname: "/ErrorPage", motivo: "LostSesion" });
    }
  }, []);

  const handleChangeSelect = (value, select) => {
    switch (select) {
      case "Especialidad":
        setEspecialidadSeleccionada(value);
        if (value !== -1) {
          setListadoPrestadores(
            prestadores.filter(
              (prestador) =>
                prestador.especialidad === value ||
                prestador.especialidad2 === value ||
                prestador.especialidad3 === value
            )
          );
        } else {
          setListadoPrestadores(prestadores);
          setPrestadorSeleccionado(-1);
        }
        break;
      case "Prestador":
        prestadores.map((prestador) => {
          if (prestador.codigo === value) {
            handleChangeSelect(prestador.especialidad, "Especialidad");
          }
        });
        setPrestadorSeleccionado(value);
        break;
      case "Cancelados":
        setFiltroCancelados(value);
        break;
      case "Asistidos":
        setFiltroAsistidos(value);
        break;
      default:
        console.log("invalid type of select");
        break;
    }
  };

  const FiltrarTurnos = (turnos) => {
    let listado = turnos || [];

    if (listado.length > 0) {
      if (especialidadSeleccionada !== -1) {
        listado = listado.filter(
          (turno) => especialidadSeleccionada === turno.especialidad
        );
      }
      if (prestadorSeleccionado !== -1) {
        listado = listado.filter(
          (turno) => prestadorSeleccionado === turno.prestadorCod
        );
      }
      if (filtroAsistidos !== -1) {
        listado = listado.filter((turno) => filtroAsistidos === turno.asistio);
      }
      if (filtroCancelados !== -1) {
        listado = listado.filter(
          (turno) => filtroCancelados === turno.aCancelar
        );
      }
    }

    return listado;
  };
  {
    /*Se buscaba filtrar las especialidades que se mostraban segun la de los turnos que se ven*/
  }
  // const FiltrarEspecialidadesXTurnos = (turnos, especialidades) => {
  //   let especialidadesFiltradas = [];
  //   if (turnos.length > 0) {
  //     turnos.map((turno) => {
  //       especialidadesFiltradas = especialidades.filter(
  //         (especialidad) => especialidad.codigo === turno.especialidad
  //       );
  //     });
  //   }
  //   return especialidadesFiltradas;
  // };

  return (
    <>
      {/*Desplegable con filtros*/}
      <IonAccordionGroup expand="inset">
        <IonAccordion value={"a"}>
          <IonItem slot="header" color="light">
            <IonLabel>Filtrar</IonLabel>
          </IonItem>
          <div slot="content">
            <IonGrid>
              <IonRow>
                <CustomDesplegable
                  array={especialidades}
                  value={especialidadSeleccionada}
                  handleChange={handleChangeSelect}
                  mostrarTodos={true}
                  label={"Seleccione un tipo de especialidad"}
                  id="Especialidad"
                />
                <CustomDesplegable
                  array={listadoPrestadores}
                  value={prestadorSeleccionado}
                  handleChange={handleChangeSelect}
                  mostrarTodos={true}
                  label={"Seleccione un prestador"}
                  id="Prestador"
                />
              </IonRow>
              <IonRow>
                <CustomDesplegable
                  array={cancelados}
                  value={filtroCancelados}
                  handleChange={handleChangeSelect}
                  mostrarTodos={true}
                  label={"Cancelados"}
                  id="Cancelados"
                />
                <CustomDesplegable
                  array={asistidos}
                  value={filtroAsistidos}
                  handleChange={handleChangeSelect}
                  mostrarTodos={true}
                  label={"Asistidos"}
                  id="Asistidos"
                />
              </IonRow>
            </IonGrid>
          </div>
        </IonAccordion>
      </IonAccordionGroup>

      {/* Tabla */}
      <IonList lines="none">
        <IonGrid>
          <IonItem className="fila cabecera">
            <IonCol className="celda cabecera" size="2.5">
              <p>Fecha</p>
            </IonCol>
            <IonCol className="celda cabecera" size="3">
              <p>Prestador</p>
            </IonCol>
            <IonCol className="celda cabecera" size="2">
              <p>Mutual</p>
            </IonCol>
            <IonCol className="celda cabecera">
              <p>Cancelado</p>
            </IonCol>
            <IonCol className="celda cabecera">
              <p>Asistido</p>
            </IonCol>
            <IonCol className="celda cabecera">
              <p>Acciones</p>
            </IonCol>
          </IonItem>
          {FiltrarTurnos(listadoTurnos).map((fila) => (
            <IonItem key={fila.nombre} className="fila">
              <IonCol className="celda" size="2.5">
                <p>{`${dayjs(fila.fecha).format("DD/MM/YYYY")} ${dayjs(
                  fila.hora
                ).format("HH:MM")}`}</p>
              </IonCol>
              <IonCol className="celda" size="3">
                <p>{fila.prestadorNom}</p>
              </IonCol>
              <IonCol className="celda" size="2">
                <p>{fila.mutualNom}</p>
              </IonCol>
              <IonCol className="celda">
                <p>{fila.aCancelar ? "Si" : "No"}</p>
              </IonCol>
              <IonCol className="celda">
                <p>{fila.asistio ? "Si" : "No"}</p>
              </IonCol>
              <IonCol className="celda">
                {dayjs(fila.fecha).isAfter(new dayjs()) ? (
                  <div className="iconColumn">
                    <IonButton shape="roud" fill="clear">
                      <IonIcon
                        size="large"
                        aria-label="Cancelar turno"
                        ios={closeOutline}
                        md={close}
                        onClick={(e) => console.log("Visualizar")}
                      />
                    </IonButton>
                  </div>
                ) : null}
              </IonCol>
            </IonItem>
          ))}
        </IonGrid>
      </IonList>
    </>
  );
}