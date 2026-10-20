import {cardClass,cardStatitics,
        tableCellClass,
        tableHeaderCellClass,
        tableLabelCellClass,
        totalRowClass,
        countInputClass} from '../uiStyles';
import { ImprestHeaders } from '../../lib/shiftsTypes'
import {
  formatRupees,
  totalImprestIssued,
  imprestRow,
  type AmountField,
  type Imprest,
} from "../../lib/earningCalculations";
 
interface ImprestProps {
  rows: Imprest[];
  onAmountChange: (rowIndex: number, field: AmountField, value: string) => void;
}

export default function Imprest({ rows, onAmountChange }: ImprestProps) {
  
  const totalIssued = totalImprestIssued(rows);
  return (
    <div>
        <div className={`flex flex-col gap-4 ${cardStatitics}`}>
          <div className={`w-full text-center bg-panel ${cardClass}` }>
            <h3 className="capitalize font-semibold ">imprest issued to Operators</h3>
            <table className="w-full border-collapse">
                    <thead>

                      <tr>
                        {ImprestHeaders.map((header)=> (

                        <th key={header.label} className={tableHeaderCellClass}>{header.label}</th>
                        ))}
                        {/* <th className={tableHeaderCellClass}>IMPREST</th>
                        <th className={tableHeaderCellClass}>ADVANCE FROM SCR</th>
                        <th className={tableHeaderCellClass}>TOTAL AMOUNT</th> */}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, rowIndex) => (
                        <tr key={`${row.tomName}-${rowIndex}`} className="even:bg-tz">
                          <th className={tableLabelCellClass}>{row.tomName}</th>
                          <td className={countInputClass}>
                            <input
                              aria-label={`${row.tomName}`}
                              className={countInputClass}
                              type="number"
                              value={row.imprestIssued || ''}
                              placeholder="0"
                              onChange={(event) => onAmountChange(rowIndex,'imprestIssued',event.target.value)}
                            
                            />
                          </td>
                          <td className={countInputClass}>
                            <input
                              aria-label={`${row.tomName}`}
                              className={countInputClass}
                              type="number"
                              value={row.advanceIssued || ''}
                              placeholder="0"
                              onChange={(event) => onAmountChange(rowIndex,'advanceIssued',event.target.value)}
                            
                            />
                          </td>
                          <td className={tableCellClass}>
                            {/* {formatRupees(totalRowClass)} */}
                          {imprestRow(row).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className={totalRowClass}>
                        <td className={tableLabelCellClass} colSpan={3}>
                          Total Imprest Issued
                        </td>
                        <td className={tableCellClass}>{formatRupees(totalIssued)}</td>
                      </tr>
                    </tfoot>
                  </table>
          </div>
        
        </div>
    </div>
  )
}
