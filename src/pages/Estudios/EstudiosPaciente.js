import React, { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router";
import axios from "axios";
import dayjs from "dayjs";
import "dayjs/locale/es";
import fileDownload from "js-file-download";

import {
  IonAccordion,
  IonAccordionGroup,
  IonButton,
  IonButtons,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonRow,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
} from "@ionic/react";

import {
  cloudDownload,
  cloudDownloadOutline,
  eye,
  eyeOutline,
} from "ionicons/icons";
import "./EstudiosPaciente.css";

import { Document, Page, pdfjs } from "react-pdf";
import CustomDesplegable from "../../components/CustomDesplegable/CustomDesplegable";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

export default function EstudiosPaciente() {
  const [usuario, setUsuario] = useState({});
  const [cargando, setCargando] = useState(false);
  const [tituloPagina, setTituloPagina] = useState("");
  const [urlAxio, setUrlAxio] = useState("");
  const [listadoEstudios, setListadoEstudios] = useState([]);
  const [listadoEstudiosFiltrados, setListadoEstudiosFiltrados] = useState([]);
  const [estudioSel, setEstudioSel] = useState(-1);
  const [listadoEstudiosFiltro, setListadoEstudiosFiltro] = useState([]);
  const [estudioPdf, setEstudioPdf] = useState({
    fecha: "",
    nombre: "",
    doc: {},
  });
  const [abrirModal, setAbrirModal] = useState(false);
  const history = useHistory();

  const abrirCerrarModal = () => setAbrirModal(!abrirModal);

  const traerEstudiosPaciente = async (paciente) => {
    let Estudios = null;
    const url = localStorage.getItem("urlAxio");
    const config = {
      headers: { Authorization: `Bearer ${paciente.token}` },
    };

    try {
      const response = await axios.get(
        `${url}EstudiosImagenes/${paciente.codigo}`,
        config
      );
      if (response.data.length !== 0) {
        Estudios = response.data;
      } else {
        Estudios = null;
      }

      setListadoEstudios(Estudios);
      setListadoEstudiosFiltrados(Estudios);
      Estudios = Estudios.filter(
        (item, index, self) =>
          index === self.findIndex((t) => t.estudioCod === item.estudioCod)
      );
      Estudios = Estudios.map((estudio) => {
        return {
          ...estudio,
          codigo: estudio.estudioCod,
          text: estudio.estudioNom,
        };
      });
      setListadoEstudiosFiltro(Estudios);
    } catch (e) {
      console.log("Error");
      console.log(e.response);
    }

    setCargando(false);
  };

  const FiltrarEstudios = (value) => {
    if (value !== -1) {
      let listado = [];

      listadoEstudios.map((estudio) => {
        if (parseInt(value) === estudio.estudioCod) {
          listado.push(estudio);
        }
      });
      setEstudioSel(value);
      setListadoEstudiosFiltrados(listado);
    } else {
      setEstudioSel(value);
      setListadoEstudiosFiltrados(listadoEstudios);
    }
  };

  const BuscarEstudio = async (estudio, pdfDoc, pdfUrl) => {
    try {
      const response = await axios.request({
        url: `${urlAxio}EstudiosImagenes/DescargarPdf/${estudio.estudioPacienteDocumento_Codigo}`,
        method: "GET",
        responseType: "blob",
        auth: `Bearer ${usuario.token}`,
      });

      if (response.data.size > 0) {
        const pdfBlob = new Blob([response.data]);
        if (pdfDoc && !pdfUrl) {
          fileDownload(
            pdfBlob,
            `${estudio.estudioNom}-${dayjs(estudio.fecha).format(
              "DD/MM/YYYY"
            )}.pdf`
          );
        } else {
          if (!pdfDoc && pdfUrl) {
            setEstudioPdf({
              fecha: estudio.fecha,
              nombre: estudio.estudioNom,
              doc: pdfBlob,
            });
            abrirCerrarModal();
          }
        }
      }
    } catch (error) {
      console.log("Error");
      console.log(error.response);
    }

    return null;
  };

  const DescargarPdf = (estudio) => {
    if (estudio) {
      BuscarEstudio(estudio, true, false);
    } else {
      console.log("Estudio sin archivo guardado");
    }
  };
  const VisualizarPdf = (estudio) => {
    if (estudio) {
      BuscarEstudio(estudio, false, true);
    } else {
      console.log("Estudio sin archivo guardado");
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

  //cosas para el modal
  const [numPages, setNumPages] = React.useState(null);
  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

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
                  array={listadoEstudiosFiltro}
                  value={estudioSel}
                  handleChange={FiltrarEstudios}
                  mostrarTodos={true}
                  label={"Seleccione un tipo de estudio"}
                  id="Estudios"
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
              <IonCol className="celda" itemProp="">
                <div className="iconColumn">
                  <IonButton shape="roud" fill="clear">
                    <IonIcon
                      size="large"
                      ios={eyeOutline}
                      md={eye}
                      onClick={() => VisualizarPdf(fila)}
                    />
                  </IonButton>
                  <IonButton shape="roud" fill="clear">
                    <IonIcon
                      size="large"
                      ios={cloudDownloadOutline}
                      md={cloudDownload}
                      onClick={() => DescargarPdf(fila)}
                    />
                  </IonButton>
                </div>
              </IonCol>
            </IonItem>
          ))}
        </IonGrid>
      </IonList>

      <IonModal isOpen={abrirModal}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>
              {`${estudioPdf.nombre}-${dayjs(estudioPdf.fecha).format(
                "DD/MM/YYYY"
              )}`}
            </IonTitle>
            <IonButtons slot="end">
              <IonButton strong={true} onClick={() => abrirCerrarModal()}>
                Cerrar
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          {estudioPdf.doc && (
            <Document
              file={estudioPdf.doc}
              onLoadSuccess={onDocumentLoadSuccess}
            >
              {[...Array(numPages)].map((_, index) => (
                <Page key={`page_${index + 1}`} pageNumber={1} />
              ))}
            </Document>
          )}
        </IonContent>
      </IonModal>
    </>
  );
}
