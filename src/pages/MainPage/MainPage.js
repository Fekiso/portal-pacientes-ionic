import {
  IonAccordion,
  IonAccordionGroup,
  IonAvatar,
  IonCol,
  IonGrid,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonRow,
  IonText,
} from "@ionic/react";
import dayjs from "dayjs";
import "dayjs/locale/es";
import axios from "axios";
import {
  calendar,
  calendarNumber,
  calendarNumberOutline,
  calendarOutline,
  fileTrayFull,
  fileTrayFullOutline,
  people,
  peopleOutline,
} from "ionicons/icons";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router";
import "./MainPage.css";

const MainPage = (props) => {
  const [cargando, setCargando] = useState(false);
  const [listadoTurnos, setListadoTurnos] = useState([]);
  const [toast, setToast] = useState({ open: false, mensaje: "", tipo: "" });
  const mostrarNotificacion = (abrir, mensaje, tipo) => {
    let notificacion = {};
    if (abrir) {
      notificacion = { open: true, mensaje: mensaje, tipo: tipo };
    } else {
      notificacion = { open: false, mensaje: "", tipo: "" };
    }
    setToast(notificacion);
  };
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
          turnos = turnos.filter((turno) => {
            return dayjs(new dayjs()).isBefore(dayjs(turno.fecha));
          });
          turnos = turnos.sort((turnoA, turnoB) => turnoA.fecha > turnoB.fecha);
          turnos = turnos.slice(0, 5);
        } else {
          turnos = [];
        }
        setListadoTurnos(turnos);
      }
    } catch (e) {
      mostrarNotificacion(
        true,
        "Ocurrió un problema al intentar consultar sus proximos turnos",
        "rojo"
      );
    }
  };

  useEffect(() => {
    setCargando(true);
    try {
      const sesion = JSON.parse(sessionStorage.getItem("ppUL"));
      if (sesion !== {}) {
        traerTurnosPaciente(sesion);
        document.title = localStorage.getItem("tituloWeb");
      }
    } catch (e) {
      history.push({ pathname: "/ErrorPage" });
    }
    setCargando(false);
  }, []);

  const handleClickRedirigir = (destino) => {
    switch (destino) {
      case "NuevoTurno":
        history.push({ pathname: "/page/Reservar" });
        break;
      case "Horarios":
        history.push({ pathname: "/page/Horarios" });
        break;
      case "Turnos":
        history.push({ pathname: "/page/Turnos" });
        break;
      case "Estudios":
        history.push({ pathname: "/page/Estudios" });
        break;
      default:
        mostrarNotificacion(true, "Seleccion invalida", "rojo");
        break;
    }
  };

  return (
    <IonGrid>
      <IonRow>
        <IonCol>
          <IonItem detail={true} lines="none">
            <IonAvatar slot="start">
              <IonIcon
                ios={calendarNumberOutline}
                md={calendarNumber}
                size="large"
              />
            </IonAvatar>
            <IonLabel>Reservar un nuevo turno</IonLabel>
          </IonItem>
        </IonCol>
        <IonCol>
          <IonItem detail={true} lines="none">
            <IonAvatar slot="start">
              <IonIcon ios={peopleOutline} md={people} size="large" />
            </IonAvatar>
            <IonLabel>Consultar horarios de prestadores</IonLabel>
          </IonItem>
        </IonCol>
      </IonRow>
      <IonRow>
        <IonCol>
          <IonItem detail={true} lines="none">
            <IonAvatar slot="start">
              <IonIcon ios={calendarOutline} md={calendar} size="large" />
            </IonAvatar>
            <IonLabel>Consultar mis turnos</IonLabel>
          </IonItem>
        </IonCol>
        <IonCol>
          <IonItem detail={true} lines="none">
            <IonAvatar slot="start">
              <IonIcon
                ios={fileTrayFullOutline}
                md={fileTrayFull}
                size="large"
              />
            </IonAvatar>
            <IonLabel>Consultar mis estudios</IonLabel>
          </IonItem>
        </IonCol>
      </IonRow>

      {/*Tabla*/}
      <IonAccordionGroup expand="inset">
        <IonAccordion value={"a"}>
          <IonItem slot="header" color="light">
            <IonText>Proximos turnos</IonText>
          </IonItem>
          <div slot="content">
            <IonList lines="none">
              <IonGrid>
                <IonItem className="fila cabecera">
                  <IonCol className="celda cabecera">
                    <p>Fecha</p>
                  </IonCol>
                  <IonCol className="celda cabecera">
                    <p>Hora</p>
                  </IonCol>
                  <IonCol className="celda cabecera">
                    <p>Prestador</p>
                  </IonCol>
                  <IonCol className="celda cabecera">
                    <p>Mutual</p>
                  </IonCol>
                </IonItem>
                {listadoTurnos.map((fila) => (
                  <IonItem key={fila.nombre} className="fila">
                    <IonCol className="celda">
                      <p>{dayjs(fila.fecha).format("DD/MM/YYYY")}</p>
                    </IonCol>
                    <IonCol className="celda">
                      <p>{dayjs(fila.hora).format("HH:MM")}</p>
                    </IonCol>
                    <IonCol className="celda">
                      <p>{fila.prestadorNom}</p>
                    </IonCol>
                    <IonCol className="celda">
                      <p>{fila.mutualNom}</p>
                    </IonCol>
                  </IonItem>
                ))}
              </IonGrid>
            </IonList>
          </div>
        </IonAccordion>
      </IonAccordionGroup>
    </IonGrid>
  );
};

export default MainPage;
