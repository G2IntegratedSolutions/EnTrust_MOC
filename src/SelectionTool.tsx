import { get } from 'http';
import { ChangeNotification, expression } from './Interfaces' // Replace 'path/to/notification' with the actual path to the 'Notification' type
import styles from './SelectionTool.module.css';
import React, { useState, useRef } from 'react';
import { changeStates, changeTopics, changeTypes, changeCategories } from './Interfaces';


interface SelectionToolProps {
    onDismiss: () => void;
    onApply: (expressions: expression[]) => void;
}

const selectableField = [
    { fieldName: "mocNumber", alias: "Moc Number", fieldType: "string", supports: "equals,not equals,contains,not contains" },
    { fieldName: "creator", alias: "Creator", fieldType: "string", supports: "equals,not equals,contains,not contains" },
    { fieldName: "owner", alias: "Owner", fieldType: "string", supports: "equals,not equals,contains,not contains" },
    { fieldName: "approver", alias: "Approver", fieldType: "string", supports: "equals,not equals,contains,not contains" },
    { fieldName: "shortDescription", alias: "Short Description", fieldType: "string", supports: "equals,not equals,contains,not contains" },
    { fieldName: "groups", alias: "Groups", fieldType: "string", supports: "equals,not equals,contains,not contains" },
    { fieldName: "cnstate", alias: "Change State", fieldType: "enum", enum: "changeState", supports: "equals,not equals" },
    { fieldName: "changeTopic", alias: "Change Topic", fieldType: "enum", enum: "changeTopic", supports: "equals,not equals" },
    { fieldName: "creationDate", alias: "Creation Date", fieldType: "date", supports: "On (Date),Before (Date),After (Date)" },
    { fieldName: "publicationDate", alias: "Publication Date", fieldType: "date", supports: "On (Date),Before (Date),After (Date)" },
    { fieldName: "dateOfImplementation", alias: "Date of Implmentation", fieldType: "date", supports: "On (Date),Before (Date),After (Date)" },
    { fieldName: "requiredDate", alias: "Required Date", fieldType: "date", supports: "On (Date),Before (Date),After (Date)" },
    { fieldName: "category", alias: "Category", fieldType: "enum", enum: "changeCategory", supports: "equals,not equals" },
    { fieldName: "changeType", alias: "Change Type", fieldType: "enum", enum: "changeType", supports: "equals,not equals" },
    { fieldName: "longDescription", alias: "Long Description", fieldType: "date", supports: "equals,not equals,contains,not contains" },
    { fieldName: "impacts", alias: "Impacts", fieldType: "date", supports: "equals,not equals,contains,not contains" },
    { fieldName: "location", alias: "Location", fieldType: "date", supports: "equals,not equals,contains,not contains" },
    { fieldName: "notes", alias: "Notes", fieldType: "date", supports: "equals,not equals,contains,not contains" },

]

const SelectionTool: React.FC<SelectionToolProps | null> = (props) => {
    const inputsRef = useRef<(HTMLInputElement | HTMLSelectElement | null)[]>([]);
    const operatorsRef = useRef<(HTMLSelectElement | null)[]>([]);
    const selectRef = useRef([]);
    //let expressionArray : {fieldName: string, operator: string, value: string}[] = [];
    const [expressionArray, setExpressionArray] = useState<{fieldName: string, operator: string, value: string}[]>([]);
    //const [expression, setExpression] = useState<string>(''); // This will be the expression that the user enters to filter the change notifications

    const getOperatorJSX = (supports: string, fieldName: string, index:number): JSX.Element => {
        const supportsArray = supports.split(',');
        return (
            <select ref={el => operatorsRef.current[index] = el} onChange={(e) => handleOnChangeOperator(e)} className={styles.operatorDropdown} name={fieldName} >
                {supportsArray.map((support, index) => {
                    return <option key={index} value={support}>{support}</option>
                })}
            </select>
        );
    }

    const getEnumJSX = (fieldName: string, enumString: string, index: number): JSX.Element => {
        let arrayToGet = changeCategories;
        if (enumString === "changeState") {
            arrayToGet = changeStates;
        } else if (enumString === "changeTopic") {
            arrayToGet = changeTopics;
        } else if (enumString === "changeType") {
            arrayToGet = changeTypes;
        }
        return (
            <select ref={el => inputsRef.current[index] = el}  onChange={(e) => handleOnChangeValue(e)} className={`form-control ${styles.enumDropdown}`} name={fieldName} >
                {arrayToGet.map((val, index) => {
                    return <option key={index} value={val}>{val}</option>
                })}
            </select>
        )
    }

    const handleClearExpression = () => {
        setExpressionArray([]);
        inputsRef.current.forEach((inputRef, index) => {
            if (inputRef !== null) {
                inputRef.value = '';
            }
        })
    }

    const handleOnChangeOperator = (e: React.ChangeEvent<HTMLSelectElement>) => {
        //console.log("handleOnChangeOperator " + e.target.name + "  " + e.target.value);
        handleOnChangeValue(e);
    }

    const handleOnChangeValue = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        let localExpressionArray : {fieldName: string, operator: string, value: string}[] = [];
        inputsRef.current.forEach((inputRef, index) => {
            if (inputRef !== null) {
                if (inputRef.value !== null && inputRef.value !== "") {
                    if(inputRef.value !== "SELECT ONE"){
                        const operatorForInput = operatorsRef.current[index]?.value;
                        const expressionForInput = {fieldName: inputRef.name, operator: operatorForInput ?? '', value: inputRef.value} as expression;
                        localExpressionArray.push(expressionForInput);
                    }            
                }
            }
        });
        setExpressionArray(localExpressionArray);
    }

    return (<div className={styles.selectionTool}>
        <h2>Search Tool</h2>
        <p>With this tool, you can select a subset of the Change Notifications in the Change Notifications table.  The reporting 
            and notification tools will respect the subset of CNs that are in your table. </p>
        <hr></hr>
        <p>Select Change Notifications Where:</p>
        <div className={styles.selectableFields}>
            {
                selectableField.map((field, index) => {
                    //const inputRef = useRef<HTMLInputElement>(null); // Add a useRef hook to create a ref for the input element
                    return (
                        <div key={index} className={styles.selectableField}>
                            <label htmlFor={field.fieldName}>{field.alias}</label>
                            {getOperatorJSX(field.supports, field.fieldName, index)}
                            {field.fieldType === 'date' && <input className='form-control' type='date' id={field.fieldName} name={field.fieldName} />}
                            {field.fieldType === "enum" && <div>
                                {getEnumJSX(field.fieldName, field.enum ?? '', index)}
                            </div>}
                            {field.fieldType === "string" &&
                                <input
                                    ref={el => inputsRef.current[index] = el} // Assign the ref to the input element
                                    className='form-control'
                                    onChange={(e) => handleOnChangeValue(e)}
                                    type='text'
                                    id={field.fieldName}
                                    name={field.fieldName}
                                />
                            }
                        </div>
                    );
                })
            }
        </div>
        <hr></hr>
        <button onClick={handleClearExpression} className='btn btn-primary'>Clear</button>
        <button className='btn btn-primary' onClick={() => props?.onApply(expressionArray)}>Apply</button>
        <button className='btn btn-primary' onClick={props?.onDismiss}>Dismiss</button>
    </div>)
}
export default SelectionTool;
