import "./showMoreFilters.css"

interface ShowMoreFiltersProps {
  showMoreFilters: boolean;
  setShowMoreFilters: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ShowMoreFilters({showMoreFilters, setShowMoreFilters}: ShowMoreFiltersProps) {
   
  const handleClick = () => {
    setShowMoreFilters(!showMoreFilters);
  };

  return (
    <div>
      <button
        onClick={handleClick}
        className="buttonShowMoreFilters"
      >
        <span>{showMoreFilters ? "−" : "+"}</span>
        {showMoreFilters ? "Menos filtros" : "Más filtros"}
      </button>

    </div>
  );
}
