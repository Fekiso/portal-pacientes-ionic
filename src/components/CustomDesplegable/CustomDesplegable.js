import { IonAlert, IonLabel } from "@ionic/react";
import { useEffect, useState } from "react";
import StyledButton from "../StyledButton/StyledButton";

const CustomDesplegable = ({ array, handleChange, mostrarTodos, label, id, value }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState(false);
  const [texto, setTexto] = useState("");

  const onHandleChange = (value, textLabel) => {
    handleChange(value, id);
    setTexto(textLabel);
    setIsOpen(false);
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
      setOptions(cargarInputs());
    }
    if (texto === "" || (value === -1 && !mostrarTodos)) {
      setTexto("Seleccione una opcion");
    }
  }, [isOpen]);

  return (
    <>
      <IonLabel>{id} : </IonLabel>
      <StyledButton
        onClick={() => setIsOpen(true)}
        fill="clear"
        expand="full"
      >{`${texto}`}</StyledButton>
      <IonAlert
        isOpen={isOpen}
        header={`${label}`}
        buttons={[
          {
            text: "Cancelar",
            role: "cancel",
            cssClass: "alert-button-cancel",
          },
        ]}
        onDidDismiss={() => setIsOpen(false)}
        inputs={options}
      />
    </>
  );
};

export default CustomDesplegable;
