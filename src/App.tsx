import './App.css'
import Autocomplete from './components/Autocomplete'
import { Option } from './types/Option';
function App() {

  const handleChange = (selectedOptions:Option) => {
    console.log('Selected options:', selectedOptions);
  };

  const options = [
    { id: 1, label: 'Apple' },
    { id: 2, label: 'Banana' },
    { id: 3, label: 'Cherry' },
    { id: 4, label: 'Date' },
    { id: 5, label: 'Elderberry' },
  ];

  const customFilterOptions = (options: Option[], inputValue: string) => {
    return options.filter(option => option.label.toLowerCase().includes(inputValue.toLowerCase()));
  };

  const renderCustomOption = (option: Option) => (
    <span className="custom-option">
      {option.label} (ID: {option.id}) {/* Custom rendering */}
    </span>
  );


  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-md max-w-md p-6 shadow-sm">
        <Autocomplete
          description="Description"
          disabled={false}
          label="Choose options"
          loading={false}
          options={options}
          onChange={handleChange}
          onInputChange={(value) => console.log('Input changed to:', value)}
          placeholder="Type to search..."
          // filterOptions={customFilterOptions}
          // renderOption={renderCustomOption}
          multiple={true}
        />
      </div>
    </div>
  );
}

export default App
