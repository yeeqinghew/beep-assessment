export interface AutocompleteProps<T> {
    description?: string; // description to display
    disabled?: boolean; // if true, component is disabled
    filterOptions?: (options: T[], inputValue: string) => T[]; // a function to determine the filtered options to be rendered on search
    label?: string; // label to display
    loading?: boolean; // if true, component will be in a loading state
    multiple?: boolean; // if true, value must be array and multiple selection is suppoerted
    onChange: (value: T[] | T) => void; // callback that is fired when the value changes
    onInputChange: (value: string) => void; // callback that is fired when the input value changes
    options: T[]; // array of options to be displayed and selected
    placeholder?: string; // placeholder search input text
    renderOption?: (option: T) => React.ReactNode; // customizes the rendered option display
    value: T[] | T; // selected value of the autocomplete
}
  