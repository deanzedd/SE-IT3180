const Table = ({ headers, data, renderRow, footerText}) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden border-gray-200">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            {headers.map((header, index) => (
                                <th 
                                    key={index} 
                                    className={`py-4 px-6 font-bold ${header.className}`}
                                >
                                    {header.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {data.length > 0 ? (
                            data.map((item, index) => renderRow(item, index))
                        ) : (
                            <tr>
                                <td colSpan={headers.length} className="py-10 text-center text-gray-500 italic">
                                    Không tìm thấy dữ liệu phù hợp
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>    
            </div>
            {footerText && (
                <div className="p-4 border-t border-gray-100 text-sm text-gray-500 bg-gray-50">
                    {footerText}
                </div>
            )}
        </div>
    );
};

export default Table;