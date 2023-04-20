import React, { useState } from "react";
import {
  IonSearchbar,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonListHeader,
  IonPopover,
  IonButton,
} from "@ionic/react";

const options = [
  "Apple",
  "Banana",
  "Cherry",
  "Durian",
  "Elderberry",
  "Fig",
  "Grape",
  "Honeydew",
  "Imbe",
  "Jackfruit",
  "Kiwi",
  "Lime",
  "Mango",
  "Nectarine",
  "Orange",
  "Papaya",
  "Quince",
  "Raspberry",
  "Strawberry",
  "Tangerine",
  "Ugli fruit",
  "Vanilla bean",
  "Watermelon",
  "Xigua (Chinese watermelon)",
  "Yellow passionfruit",
  "Zucchini",
];

const CustomAutocompleteInput = () => {
  const [searchText, setSearchText] = useState("");
  const [showPopover, setShowPopover] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");

  const handleSearchTextChange = (e) => {
    const searchText = e.target.value;
    setSearchText(searchText);
    if (searchText === "") {
      setShowPopover(false);
    } else {
      setShowPopover(true);
    }
  };

  const handleOptionClick = (option) => {
    setSearchText(option);
    setShowPopover(false);
  };

  return (
    <>
      <IonSearchbar value={searchText} onIonChange={handleSearchTextChange} />
      <IonPopover isOpen={showPopover} onDidDismiss={() => setShowPopover(false)}>
        <IonList>
          {options
            .filter((option) => option.toLowerCase().includes(searchText.toLowerCase()))
            .map((option, i) => (
              <IonItem key={i} onClick={() => handleOptionClick(option)}>
                {option}
              </IonItem>
            ))}
        </IonList>
      </IonPopover>
    </>
  );
};

export default CustomAutocompleteInput;
