import {
  IonAlert,
  IonButton,
  IonButtons,
  IonCard,
  IonCardHeader,
  IonCol,
  IonContent,
  IonDatetime,
  IonDatetimeButton,
  IonFooter,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonModal,
  IonNote,
  IonTitle,
  IonToast,
  IonToolbar,
} from "@ionic/react";
import axios from "axios";
import dayjs from "dayjs";
import { closeOutline } from "ionicons/icons";
import React, { useEffect, useState } from "react";
import CustomDesplegable from "../../components/CustomDesplegable/CustomDesplegable";
import CustomToast from "../../components/CustomToast/CustomToast";
import DialogoConfirmacion from "../../components/DialogoConfirmacion/DialogoConfirmacion";
import StyledButton from "../../components/StyledButton/StyledButton";

const NuevoPaciente = ({ openModal, closeModal }) => {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [correo, setCorreo] = useState("");
  const [fechaNac, setFechaNac] = useState("");
  const [telefono, setTelefono] = useState("");
  const [nroDocumento, setNroDocumento] = useState("");
  const [tiposDoc, setTiposDoc] = useState([]);
  const [mutuales, setMutuales] = useState([]);
  const [mutualAfiliado, setMutualAfiliado] = useState("");
  const [tipoDoc, setTipoDoc] = useState(-1);
  const [mutual, setMutual] = useState(-1);
  const [errores, setErrores] = useState({
    nombre: false,
    apellido: false,
    correo: false,
    fechaNac: false,
    fechaSelect: false,
    telefono: false,
    nroDocumento: false,
    mutualAfiliado: false,
    tipoDoc: false,
    mutual: false,
  });
  const [openToast, setOpenToast] = useState(false);
  const [abrirModalCancelarRegistro, setAbrirModalCancelarRegistro] = useState(false);

  const traerTiposDocs = async () => {
    let tiposDocs = null;
    const url = localStorage.getItem("urlAxio");

    try {
      const response = await axios.get(`${url}Pacientes/DocumentoTipoTraer`);
      if (response.data.length !== 0) {
        tiposDocs = response.data;
      } else {
        tiposDocs = null;
      }

      tiposDocs = tiposDocs.map((tipoDoc) => {
        return {
          ...tipoDoc,
          text: tipoDoc.nombre,
        };
      });

      setTiposDoc(tiposDocs);
    } catch (e) {
      console.log("Error");
      console.log(e.response);
    }
  };

  const traerMutuales = async () => {
    let mutuales = null;
    const url = localStorage.getItem("urlAxio");

    try {
      const response = await axios.get(`${url}Mutuales`);
      if (response.data.length !== 0) {
        mutuales = response.data;
      } else {
        mutuales = null;
      }

      mutuales = mutuales.map((mutual) => {
        return {
          ...mutual,
          text: mutual.nombre,
        };
      });

      setMutuales(mutuales);
    } catch (e) {
      console.log("Error");
      console.log(e.response);
    }
  };

  useEffect(() => {
    traerTiposDocs();
    traerMutuales();
  }, [openModal]);

  const handleChangeSelect = (value, select) => {
    switch (select) {
      case "Mutual":
        setMutual(value);
        break;
      case "Tipo Documento":
        setTipoDoc(value);
        break;
      default:
        console.log("invalid type of select");
        break;
    }
  };

  const handleClickChangeFecha = (signo) => {
    if (signo === "+") {
      setFechaNac(dayjs(fechaNac).add(1, "days").format("YYYY-MM-DD"));
    }
    if (signo === "-") {
      setFechaNac(dayjs(fechaNac).subtract(1, "days").format("YYYY-MM-DD"));
    }
  };

  const validarFormRegistroPaciente = () => {
    let pasa = true;
    let errors = {};
    if (nombre === "" || nombre === null || nombre === undefined) {
      pasa = false;
      errors.nombre = true;
    }
    if (apellido === "" || apellido === null || apellido === undefined) {
      pasa = false;
      errors.apellido = true;
    }
    if (fechaNac === "" || fechaNac === null || fechaNac === undefined) {
      pasa = false;
      errors.fechaNac = true;
    }
    if (telefono === "" || telefono === null || telefono === undefined) {
      pasa = false;
      errors.telefono = true;
    }
    if (nroDocumento === "" || nroDocumento === null || nroDocumento === undefined) {
      pasa = false;
      errors.nroDocumento = true;
    }
    if (
      correo === "" ||
      correo === null ||
      correo === undefined ||
      !/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g.test(
        correo
      )
    ) {
      pasa = false;
      errors.correo = true;
    }
    if (tipoDoc === {} || tipoDoc === null || tipoDoc === undefined) {
      pasa = false;
      errors.tipoDoc = true;
    }
    if (mutual === {} || mutual === null || mutual === undefined) {
      pasa = false;
      errors.mutual = true;
    }
    if (
      (mutualAfiliado === "" || mutualAfiliado === null || mutualAfiliado === undefined) &&
      mutual.codigo !== 1
    ) {
      pasa = false;
      errors.mutualAfiliado = true;
    }
    setErrores(errors);
    return pasa;
  };

  const registrarPaciente = async () => {
    const token = sessionStorage.getItem("AppHCToken");
    const url = localStorage.getItem("urlAxio");

    let config = {
      headers: { Authorization: `Bearer ${token}` },
    };

    try {
      if (validarFormRegistroPaciente) {
        const response = await axios.post(
          `${url}pacientes`,
          {
            hc: this.state.nroDocumento,
            documentoNro: this.state.nroDocumento,
            documentoTipo: this.state.tipoDoc.codigo,
            documentoTipoNombre: this.state.tipoDoc.nombre,
            nombre: this.state.nombre,
            apellido: this.state.apellido,
            mutual: this.state.mutual.codigo,
            mutualNombre: this.state.mutual.nombre,
            celular: this.state.telefono,
            email: this.state.correo,
            mutualAfiliado: this.state.mutual.codigo !== 1 ? this.state.mutualAfiliado : "-",
            nacimiento: this.state.fechaNac,
            password: this.state.nroDocumento,
          },
          config
        );
        if (response) {
          console.log("Registrado");
        }
      } else {
        // this.snackbarEstado(true, "Faltan de rellenar algunos campos", "Error");
      }
    } catch (e) {
      console.log("Error");
      console.log(e.response);
    }
  };

  const togleAbrirCerrarCancelarRegistro = () => {
    setAbrirModalCancelarRegistro(!abrirModalCancelarRegistro);
  };
  const confirmarCancelarRegistro = () => {
    setAbrirModalCancelarRegistro(false);
    closeModal();
  };

  // agregar metodos modal confirmacion y cierre de ventana
  return (
    <IonModal isOpen={openModal} backdropDismiss={false}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Registrarme como nuevo paciente</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding" id="inbox-list">
        <IonList>
          <IonNote>Datos personales</IonNote>
          <IonItem>
            <IonInput
              label="Nombre"
              label-placement="floating"
              value={nombre}
              onIonChange={(e) => setNombre(e.target.value)}
            />
          </IonItem>
          <IonItem>
            <IonInput
              label="Apellido"
              label-placement="floating"
              value={apellido}
              onIonChange={(e) => setApellido(e.target.value)}
            />
          </IonItem>
          <IonItem>
            <IonInput
              type="date"
              placeholder="Ingrese su apellido"
              label="Fecha de nacimiento"
              label-placement="floating"
              value={fechaNac}
              onIonChange={(e) => setFechaNac(e.target.value)}
            />
          </IonItem>
          <IonItem>
            <CustomDesplegable
              array={tiposDoc}
              value={tipoDoc}
              handleChange={handleChangeSelect}
              mostrarTodos={false}
              label={"Tipo de documento"}
              id="Tipo Documento"
              ocultarLabel={true}
            />
          </IonItem>
          <IonItem>
            <IonInput
              inputMode="numeric"
              label="Numero de documento"
              label-placement="floating"
              value={nroDocumento}
              onIonChange={(e) => setNroDocumento(e.target.value)}
            />
          </IonItem>
        </IonList>
        <IonList>
          <IonNote>Datos de mutual</IonNote>
          <IonItem>
            <CustomDesplegable
              array={mutuales}
              value={mutual}
              handleChange={handleChangeSelect}
              mostrarTodos={false}
              label={"Mutual"}
              id="Mutual"
              ocultarLabel={true}
            />
          </IonItem>
          <IonItem>
            <IonInput
              label="Numero de afiliado"
              label-placement="floating"
              value={mutualAfiliado}
              onIonChange={(e) => setMutualAfiliado(e.target.value)}
            />
          </IonItem>
        </IonList>
        <IonList>
          <IonNote>Datos de contacto</IonNote>
          <IonItem>
            <IonInput
              label="Telefono"
              label-placement="floating"
              value={telefono}
              onIonChange={(e) => setTelefono(e.target.value)}
            />
          </IonItem>
          <IonItem>
            <IonInput
              label="Correo electronico"
              label-placement="floating"
              value={correo}
              onIonChange={(e) => setCorreo(e.target.value)}
            />
          </IonItem>
        </IonList>
      </IonContent>
      <IonFooter>
        <IonToolbar>
          <StyledButton lines="none" className="rojo" onclick={togleAbrirCerrarCancelarRegistro}>
            Cancelar registro
          </StyledButton>
          <StyledButton lines="none" className="rojo" onClick={(e) => setOpenToast(true)}>
            Registrarme
          </StyledButton>
        </IonToolbar>
      </IonFooter>
      <DialogoConfirmacion
        titulo="Cancelar registro"
        contenido="¿Esta seguro de cancelar el registro? Se perderan los datos que haya cargado"
        abrirCerrarModal={abrirModalCancelarRegistro}
        handleclickCancelar={togleAbrirCerrarCancelarRegistro}
        handleclickConfirmar={confirmarCancelarRegistro}
        colorBotonNo="amarillo"
        colorBotonSi="rojo"
        textoBotonNo="Cancelar"
        textoBotonSi="Estoy seguro"
      />
      <CustomToast
        openToast={openToast}
        onDidDismiss={(e) => setOpenToast(false)}
        message="This toast will disappear after 5 seconds"
        tipo="verde"
      />
    </IonModal>
  );
};

export default NuevoPaciente;
