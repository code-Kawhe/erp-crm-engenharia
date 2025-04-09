export const customStyles = {
    control: (base) => ({
      ...base,
      backgroundColor: 'white',
      borderColor: '#011A39',
      minHeight: 40,
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: '#011A39',
      color: 'white',
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: 'white',
      fontWeight: 'bold',
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? '#011A39' : 'white',
      color: state.isFocused ? 'white' : '#011A39',
    }),
    singleValue: (base) => ({
      ...base,
      color: '#011A39',
    }),
    input: (base) => ({
      ...base,
      color: '#011A39',
    }),
  }
