import {
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonList,
  IonModal,
  IonNote,
  IonPopover,
  IonRow,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import axios from "axios";
import dayjs from "dayjs";
import { alert, alertOutline } from "ionicons/icons";
import { useEffect, useState } from "react";
import CustomDesplegable from "../../components/CustomDesplegable/CustomDesplegable";
import CustomToast from "../../components/CustomToast/CustomToast";
import DialogoConfirmacion from "../../components/DialogoConfirmacion/DialogoConfirmacion";
import LoadingBackdrop from "../../components/LoadingBackdrop/LoadingBackdrop";
import StyledButton from "../../components/StyledButton/StyledButton";

const NuevoPaciente = ({ openModal, closeModal, mostrarNotificacion }) => {
  const [cargando, setCargando] = useState(false);
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
      mostrarNotificacion(
        true,
        "Ha ocurrido un error al intentar cargar los tipos de documentos",
        "rojo"
      );
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
      mostrarNotificacion(
        true,
        "Ha ocurrido un error al intentar cargar las mutuales registradas",
        "rojo"
      );
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
        mostrarNotificacion(true, "Seleccion invalida", "rojo");
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

  const getTextoDesplegableSeleccionado = (array, codigo) => {
    return array[array.findIndex((item) => item.codigo === codigo)].text;
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
    if (tipoDoc === {} || tipoDoc === null || tipoDoc === undefined || tipoDoc === -1) {
      pasa = false;
      errors.tipoDoc = true;
    }
    if (mutual === {} || mutual === null || mutual === undefined || mutual === -1) {
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
      const response = await axios.post(
        `${url}pacientes`,
        {
          hc: nroDocumento,
          documentoNro: nroDocumento,
          documentoTipo: tipoDoc,
          documentoTipoNombre: getTextoDesplegableSeleccionado(tiposDoc, tipoDoc),
          nombre: nombre,
          apellido: apellido,
          mutual: mutual,
          mutualNombre: getTextoDesplegableSeleccionado(mutuales, mutual),
          celular: telefono,
          email: correo,
          mutualAfiliado: mutual !== 1 ? mutualAfiliado : "-",
          nacimiento: fechaNac,
          password: nroDocumento,
        },
        config
      );
      if (response) {
        if (response.status === 200) {
          mostrarNotificacion(true, "Usuario registrado correctamente", "verde");
          limpiarCampos();
          closeModal();
        }
        if (response.status === 400) {
          mostrarNotificacion(
            true,
            "No se ha podido registrar el nuevo usuario debido a: " + response,
            "rojo"
          );
        }
      } else {
        mostrarNotificacion(true, "Falta rellenar algunos campos", "rojo");
      }
    } catch ({ response }) {
      mostrarNotificacion(true, "Error: " + response.data, "rojo");
    }
  };

  const limpiarCampos = () => {
    setNombre("");
    setApellido("");
    setFechaNac("");
    setTipoDoc(-1);
    setNroDocumento("");
    setMutual(-1);
    setMutualAfiliado("");
    setTelefono("");
    setCorreo("");
  };

  const togleAbrirCerrarCancelarRegistro = () => {
    setAbrirModalCancelarRegistro(!abrirModalCancelarRegistro);
  };

  const confirmarCancelarRegistro = () => {
    togleAbrirCerrarCancelarRegistro();
    limpiarCampos();
    closeModal();
  };

  const handleClickRegistrarPaciente = () => {
    if (validarFormRegistroPaciente()) {
      registrarPaciente();
    }
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
              onKeyUp={(e) => setNombre(e.target.value)}
              className={`${errores.nombre && "ion-invalid"}`}
            />

            {errores.nombre && (
              <>
                <IonIcon
                  aria-hidden="true"
                  slot="end"
                  ios={alertOutline}
                  md={alert}
                  id="btnErrorNombre"
                  size="small"
                  color="danger"
                />
                <IonPopover trigger="btnErrorNombre" triggerAction="click">
                  <IonContent class="ion-padding">No se ingreso el nombre</IonContent>
                </IonPopover>
              </>
            )}
          </IonItem>
          <IonItem>
            <IonInput
              label="Apellido"
              label-placement="floating"
              value={apellido}
              onKeyUp={(e) => setApellido(e.target.value)}
              className={`${errores.apellido && "ion-invalid"}`}
            />
            {errores.apellido && (
              <>
                <IonIcon
                  aria-hidden="true"
                  slot="end"
                  ios={alertOutline}
                  md={alert}
                  id="btnErrorApellido"
                  size="small"
                  color="danger"
                />
                <IonPopover trigger="btnErrorApellido" triggerAction="click">
                  <IonContent class="ion-padding">No se ingreso el apellido</IonContent>
                </IonPopover>
              </>
            )}
          </IonItem>
          <IonItem>
            <IonInput
              type="date"
              placeholder="Ingrese su apellido"
              label="Fecha de nacimiento"
              label-placement="floating"
              value={fechaNac}
              onIonChange={(e) => setFechaNac(e.target.value)}
              min={dayjs(new dayjs()).subtract(110, "year").format("YYYY-MM-DD")}
              max={dayjs(new dayjs()).format("YYYY-MM-DD")}
              className={`${errores.fechaNac && "ion-invalid"}`}
            />
            {errores.fechaNac && (
              <>
                <IonIcon
                  aria-hidden="true"
                  slot="end"
                  ios={alertOutline}
                  md={alert}
                  id="btnErrorFechaNac"
                  size="small"
                  color="danger"
                />
                <IonPopover trigger="btnErrorFechaNac" triggerAction="click">
                  <IonContent class="ion-padding">
                    No se ingreso una fecha de nacimiento valida
                  </IonContent>
                </IonPopover>
              </>
            )}
          </IonItem>
          <IonItem>
            <CustomDesplegable
              array={tiposDoc}
              value={tipoDoc}
              handleChange={handleChangeSelect}
              mostrarTodos={false}
              mostrarSearch={false}
              barraBusqueda={true}
              label={"Tipo de documento"}
              id="Tipo Documento"
              ocultarLabel={true}
              className={`${errores.tipoDoc && "ion-invalid"}`}
              errorText="No se selecciono un tipo de documento"
            />
            {errores.tipoDoc && (
              <>
                <IonIcon
                  aria-hidden="true"
                  slot="end"
                  ios={alertOutline}
                  md={alert}
                  id="btnErrorTipoDoc"
                  size="small"
                  color="danger"
                />
                <IonPopover trigger="btnErrorTipoDoc" triggerAction="click">
                  <IonContent class="ion-padding">No se selecciono un tipo de documento</IonContent>
                </IonPopover>
              </>
            )}
          </IonItem>
          <IonItem>
            <IonInput
              inputMode="numeric"
              label="Numero de documento"
              label-placement="floating"
              value={nroDocumento}
              onKeyUp={(e) => setNroDocumento(e.target.value)}
              className={`${errores.nroDocumento && "ion-invalid"}`}
            />
            {errores.nroDocumento && (
              <>
                <IonIcon
                  aria-hidden="true"
                  slot="end"
                  ios={alertOutline}
                  md={alert}
                  id="btnErrorNroDocumento"
                  size="small"
                  color="danger"
                />
                <IonPopover trigger="btnErrorNroDocumento" triggerAction="click">
                  <IonContent class="ion-padding">No se ingreso un numero de documento</IonContent>
                </IonPopover>
              </>
            )}
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
              mostrarSearch={true}
              barraBusqueda={true}
              label={"Mutual"}
              id="Mutual"
              ocultarLabel={true}
              className={`${errores.mutual && "ion-invalid"}`}
            />
            {errores.mutual && (
              <>
                <IonIcon
                  aria-hidden="true"
                  slot="end"
                  ios={alertOutline}
                  md={alert}
                  id="btnErrorMutual"
                  size="small"
                  color="danger"
                />
                <IonPopover trigger="btnErrorMutual" triggerAction="click">
                  <IonContent class="ion-padding">No se selecciono una mutual</IonContent>
                </IonPopover>
              </>
            )}
          </IonItem>
          <IonItem>
            <IonInput
              label="Numero de afiliado"
              label-placement="floating"
              value={mutualAfiliado}
              onKeyUp={(e) => setMutualAfiliado(e.target.value)}
              className={`${errores.mutualAfiliado && "ion-invalid"}`}
            />
            {errores.mutualAfiliado && (
              <>
                <IonIcon
                  aria-hidden="true"
                  slot="end"
                  ios={alertOutline}
                  md={alert}
                  id="btnErrorMutualAfiliado"
                  size="small"
                  color="danger"
                />
                <IonPopover trigger="btnErrorMutualAfiliado" triggerAction="click">
                  <IonContent class="ion-padding">
                    No se ingreso un numero de afiliado, en caso de no tener
                  </IonContent>
                </IonPopover>
              </>
            )}
          </IonItem>
        </IonList>
        <IonList>
          <IonNote>Datos de contacto</IonNote>
          <IonItem>
            <IonInput
              label="Telefono"
              label-placement="floating"
              value={telefono}
              onKeyUp={(e) => setTelefono(e.target.value)}
              className={`${errores.telefono && "ion-invalid"}`}
            />
            {errores.telefono && (
              <>
                <IonIcon
                  aria-hidden="true"
                  slot="end"
                  ios={alertOutline}
                  md={alert}
                  id="btnErrorTelefono"
                  size="small"
                  color="danger"
                />
                <IonPopover trigger="btnErrorTelefono" triggerAction="click">
                  <IonContent class="ion-padding">No se ingreso un telefono de contacto</IonContent>
                </IonPopover>
              </>
            )}
          </IonItem>
          <IonItem>
            <IonInput
              label="Correo electronico"
              label-placement="floating"
              value={correo}
              onKeyUp={(e) => setCorreo(e.target.value)}
              className={`${errores.correo && "ion-invalid"}`}
            />
            {errores.correo && (
              <>
                <IonIcon
                  aria-hidden="true"
                  slot="end"
                  ios={alertOutline}
                  md={alert}
                  id="btnErrorCorreo"
                  size="small"
                  color="danger"
                />
                <IonPopover trigger="btnErrorCorreo" triggerAction="click">
                  <IonContent class="ion-padding">
                    No se ingreso un correo electronico valido
                  </IonContent>
                </IonPopover>
              </>
            )}
          </IonItem>
        </IonList>
      </IonContent>
      <IonFooter>
        <IonToolbar>
          <IonRow className="ion-justify-content-around">
            <StyledButton
              lines="none"
              className="rojo  ion-padding-horizontal"
              onclick={togleAbrirCerrarCancelarRegistro}
            >
              Cancelar registro
            </StyledButton>
            <StyledButton
              lines="none"
              className="verde  ion-padding-horizontal"
              onClick={handleClickRegistrarPaciente}
            >
              Registrarme
            </StyledButton>
          </IonRow>
        </IonToolbar>
      </IonFooter>

      <DialogoConfirmacion
        titulo="Cancelar registro"
        contenido="¿Esta seguro de cancelar el registro? Se perderan los datos que haya cargado"
        abrirCerrarModal={abrirModalCancelarRegistro}
        handleclickBotonNo={togleAbrirCerrarCancelarRegistro}
        handleclickBotonSi={confirmarCancelarRegistro}
        colorBotonNo="amarillo"
        colorBotonSi="rojo"
        textoBotonNo="Cancelar"
        textoBotonSi="Estoy seguro"
      />
      {cargando && <LoadingBackdrop visualizar={cargando} />}
    </IonModal>
  );
};

export default NuevoPaciente;
