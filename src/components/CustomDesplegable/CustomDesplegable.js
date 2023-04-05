import { IonCol, IonItem, IonSelect, IonSelectOption } from "@ionic/react";
import React from "react";

const CustomDesplegable = ({
  array,
  handleChange,
  mostrarTodos,
  label,
  id,value
}) => {
  return (
    <IonCol size="12" size-md="6">
      <IonItem>
        <IonSelect
          id={id}
          value={value}
          placeholder={label}
          onIonChange={(ev) => handleChange(ev.detail.value, id)}
          label={`${id}:`}
        >
          {mostrarTodos ? (
            <IonSelectOption key={-1} value={-1}>
              Mostrar todos
            </IonSelectOption>
          ) : null}
          {array.map((item) => (
            <IonSelectOption key={item.codigo} value={item.codigo}>
              {item.text}
            </IonSelectOption>
          ))}
        </IonSelect>
      </IonItem>
    </IonCol>
  );
};

export default CustomDesplegable;
