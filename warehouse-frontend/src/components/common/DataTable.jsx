const DataTable = ({ columns = [], children, loading, empty }) => (
  <div style={{ overflowX: 'auto' }}>
    <table>
      <thead>
        <tr>
          {columns.map((col, i) => (
            <th key={i} style={col.width ? { width: col.width } : {}}>{col.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {children}
      </tbody>
    </table>
  </div>
)

export default DataTable
