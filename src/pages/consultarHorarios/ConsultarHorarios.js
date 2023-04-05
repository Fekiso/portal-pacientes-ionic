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
  IonContent,
  IonGrid,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonRow,
  IonSegment,
  IonSegmentButton,
  IonSelect,
  IonSelectOption,
} from "@ionic/react";

import {
  cloudDownload,
  cloudDownloadOutline,
  eye,
  eyeOutline,
} from "ionicons/icons";
import "./ConsultarHorarios.css";

const compareWith = (orr1, orr2) => {
  //verifico que los argumentos no esten vacios
  if (!orr1 || !orr2) {
    return orr1 === orr2;
  }
  //verifico que arr2 sea array
  if (Array.isArray(orr2)) {
    //itero el array para encontrar el item que tenga el id seleccionado
    return orr2.some((o) => o.id === orr1.id);
  }
  //En caso que no sea un array busco que el id del obj arr1 consida con el del otro obj arr2
  return orr1.id === orr2.id;
};

export default function ConsultarHorarios() {
  const [usuario, setUsuario] = useState({});
  const [cargando, setCargando] = useState(false);
  const [urlAxio, setUrlAxio] = useState("");
  const [tituloPagina, setTituloPagina] = useState("");
  const [listadoEstudios, setListadoEstudios] = useState([]);
  const [listadoEstudiosFiltrados, setListadoEstudiosFiltrados] = useState([]);
  const [listadoEstudiosFiltro, setListadoEstudiosFiltro] = useState([]);
  const [pdfUrl, setPdfUrl] = useState();
  const history = useHistory();

  const traerEstudiosPaciente = async (paciente) => {
    let Estudios = null;
    let servicio = null;
    var config = {
      headers: { Authorization: `Bearer ${paciente.token}` },
    };
    const url = localStorage.getItem("urlAxio");
    if (paciente !== null) {
      setCargando(true);
      await axios
        .get(`${url}EstudiosImagenes/${paciente.codigo}`, config)
        .then((response) => {
          if (response.data.length !== 0) {
            Estudios = response.data;
            Estudios.map((estudio) => {
              estudio.cargado = false;
            });
          } else {
            Estudios = null;
          }
        })
        .catch((e) => {
          console.log("Error");
          console.log(e.response);
          setCargando(true);
        });
      servicio = null;
      setCargando(true);
      setListadoEstudios(Estudios);
      setListadoEstudiosFiltrados(Estudios);
      setListadoEstudiosFiltro(
        Estudios.filter(
          (item, index, self) =>
            index === self.findIndex((t) => t.estudioCod === item.estudioCod)
        )
      );
    }
  };

  const FiltrarEstudios = (codEstudio) => {
    if (parseInt(codEstudio) !== -1) {
      let listado = [];

      listadoEstudios.map((estudio) => {
        if (parseInt(codEstudio) === estudio.estudioCod) {
          listado.push(estudio);
        }
      });

      setListadoEstudiosFiltrados(listado);
    } else {
      setListadoEstudiosFiltrados(listadoEstudios);
    }
  };

  useEffect(() => {
    try {
      const sesion = JSON.parse(sessionStorage.getItem("ppUL"));
      if (sesion !== {}) {
        traerEstudiosPaciente(sesion);
        setUsuario(sesion);
        setUrlAxio(localStorage.getItem("urlAxio"));
        setTituloPagina(localStorage.getItem("nombreClinica"));
        document.title = localStorage.getItem("tituloWeb");
      }
    } catch (e) {
      history.push({ pathname: "/ErrorPage", motivo: "LostSesion" });
    }
  }, []);

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
                <IonCol size="12" size-md="6" size-lg="4">
                  <IonItem>
                    <IonSelect
                      placeholder="Elija tipo de estudio"
                      compareWith={compareWith}
                      onIonChange={(ev) =>
                        FiltrarEstudios(JSON.stringify(ev.detail.value))
                      }
                    >
                      <IonSelectOption key={-1} value={-1}>
                        Mostrar todos
                      </IonSelectOption>
                      {listadoEstudiosFiltro.map((estudio) => (
                        <IonSelectOption
                          key={estudio.estudioCod}
                          value={estudio.estudioCod}
                        >
                          {estudio.estudioNom}
                        </IonSelectOption>
                      ))}
                    </IonSelect>
                  </IonItem>
                </IonCol>
              </IonRow>
            </IonGrid>
          </div>
        </IonAccordion>
      </IonAccordionGroup>

      {/* Tabla */}
      <IonList lines="none">
        <IonGrid>
          <IonItem className="fila cabecera">
            <IonCol className="celda cabecera">
              <p>Fecha</p>
            </IonCol>
            <IonCol className="celda cabecera">
              <p>Nombre de estudio</p>
            </IonCol>
            <IonCol className="celda cabecera">
              <p>Acciones</p>
            </IonCol>
          </IonItem>
          {listadoEstudiosFiltrados.map((fila) => (
            <IonItem key={fila.nombre} className="fila">
              <IonCol className="celda">
                <p>{dayjs(fila.fecha).format("DD/MM/YYYY")}</p>
              </IonCol>
              <IonCol className="celda">
                <p>{fila.estudioNom}</p>
              </IonCol>
              <IonCol className="celda">
                <div className="iconColumn">
                  <IonIcon
                    aria-hidden="true"
                    size="large"
                    ios={eyeOutline}
                    md={eye}
                    onClick={(e) => console.log("Visualizar")}
                  />
                  <IonIcon
                    aria-hidden="true"
                    size="large"
                    ios={cloudDownloadOutline}
                    md={cloudDownload}
                    onClick={(e) => console.log("Descargar")}
                  />
                </div>
              </IonCol>
            </IonItem>
          ))}
        </IonGrid>
      </IonList>
    </>
  );
}
