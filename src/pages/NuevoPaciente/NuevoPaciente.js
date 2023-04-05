import {
  IonContent,
  IonFooter,
  IonHeader,
  IonModal,
  IonToolbar,
} from "@ionic/react";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";

const NuevoPaciente = () => {
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
  const [modalMensaje, setModalMensaje] = useState({ open: false, motivo: "" });

  const traerTiposDocs = async () => {
    let tiposDocs = null;
    const url = localStorage.getItem("urlAxio");

    try {
      const response = await axios.get(
        `${url}Pacientes/DocumentoTipoTraer`,
        config
      );
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
      const response = await axios.get(`${url}Mutuales`, config);
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
  }, []);

  const handleChangeSelect = (value, select) => {
    switch (select) {
      case "Mutual":
        setMutual(value);
        break;
      case "TipoDoc":
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
    if (
      nroDocumento === "" ||
      nroDocumento === null ||
      nroDocumento === undefined
    ) {
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
      (mutualAfiliado === "" ||
        mutualAfiliado === null ||
        mutualAfiliado === undefined) &&
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
            mutualAfiliado:
              this.state.mutual.codigo !== 1 ? this.state.mutualAfiliado : "-",
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

  // agregar metodos modal confirmacion y cierre de ventana
  return (
    <IonModal isOpen={true}>
      <IonHeader>
        <IonToolbar>
          <h3>Registrarme como nuevo paciente</h3>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding"></IonContent>
      <IonFooter>
        <IonToolbar></IonToolbar>
      </IonFooter>
    </IonModal>
  );
};

export default NuevoPaciente;
