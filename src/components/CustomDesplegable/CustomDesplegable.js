import {
  IonAlert,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { radioButtonOff, radioButtonOffOutline, radioButtonOnOutline } from "ionicons/icons";
import { useEffect, useState } from "react";
import StyledButton from "../StyledButton/StyledButton";

const CustomDesplegable = ({
  array,
  handleChange,
  mostrarTodos,
  mostrarSearch,
  label,
  id,
  value,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [texto, setTexto] = useState("");
  const [searchText, setSearchText] = useState("");
  const [options, setOptions] = useState(false);
  const [opcionesValidas, setOpcionesValidas] = useState([]);

  const onHandleChange = (value, textLabel) => {
    handleChange(value, id);
    setTexto(textLabel);
    setIsOpen(false);
  };

  const FiltrarOpciones = (ev) => {
    const texto = ev.target.value;
    const opciones = array.filter((item) => item.text.toLowerCase().includes(texto.toLowerCase()));
    setOpcionesValidas(opciones);
    setSearchText(texto);
  };

  const cargarInputs = () => {
    const arrayInputs = [];

    if (mostrarTodos) {
      arrayInputs.push({
        label: "Mostrar todos",
        type: "radio",
        value: -1,
        checked: -1 === value && mostrarTodos,
        handler: (target) => onHandleChange(target.value, target.label),
      });
    }

    array.forEach((item) => {
      arrayInputs.push({
        label: item.text,
        type: "radio",
        value: item.codigo,
        checked: item.codigo === value,
        handler: (target) => onHandleChange(target.value, target.label),
      });
    });

    return arrayInputs;
  };

  useEffect(() => {
    if (isOpen) {
      setOpcionesValidas(array);
    }
    if (texto === "" || (value === -1 && !mostrarTodos)) {
      // setTexto("Seleccione una opcion");
    }
  }, [isOpen]);

  return (
    <>
      <IonLabel position={"floating"}>{id}: </IonLabel>
      <IonInput onFocus={() => setIsOpen(true)} value={texto} />

      <IonModal isOpen={isOpen} onWillDismiss={() => setIsOpen(false)}>
        <IonHeader>
          <IonToolbar>
            <StyledButton slot="end" fill="clear" expand="full" onClick={() => setIsOpen(false)}>
              Cancelar
            </StyledButton>
            <IonTitle>{id}</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          {mostrarSearch && (
            <IonSearchbar
              value={searchText}
              onIonInput={(ev) => FiltrarOpciones(ev)}
              debounce={500}
              placeholder="Buscar por nombre"
            />
          )}
          <IonList>
            {mostrarTodos && (
              <IonItem
                key={-1}
                value={-1}
                button
                onClick={({ target }) => onHandleChange(-1, "Mostrar todos")}
              >
                <IonLabel>Mostrar todos</IonLabel>
                <IonIcon
                  slot="start"
                  icon={-1 !== value ? radioButtonOffOutline : radioButtonOnOutline}
                  size="large"
                />
              </IonItem>
            )}
            {opcionesValidas.map((item) => (
              <IonItem
                key={item.codigo}
                value={item.codigo}
                button
                onClick={(target) => onHandleChange(item.codigo, item.text)}
              >
                <IonLabel>{item.text}</IonLabel>
                <IonIcon
                  slot="start"
                  icon={item.codigo !== value ? radioButtonOffOutline : radioButtonOnOutline}
                  size="large"
                />
              </IonItem>
            ))}
          </IonList>
        </IonContent>
      </IonModal>
    </>
  );
};

export default CustomDesplegable;
