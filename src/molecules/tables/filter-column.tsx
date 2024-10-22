import { Cross1Icon } from '@radix-ui/react-icons';
import { Trash2 } from 'lucide-react';
import React, { Dispatch, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import AdvancedCalendar from '../advanced-calendar';
import { MultiSelect, MultiSelectProps } from '../multi-select';
import CustomTableActionDialog from '../dialog';
import DataTable from '.';
import { autoColumnData } from './tables.stories';
import { data } from './data';

export type ColumnFilter = BaseColumnFilter &
  (
    | StandartColumnFilter
    | SelectColumnFilter
    | BooleanColumnFilter
    | MultipleFilter
    | AsyncFilter
  );

export type BaseColumnFilter = {
  displayName: string;
  name: string;
  value: string;
};
export type SelectColumnFilter = {
  options: { label: string; value: string }[];
  placeholder: string;
  type: 'select';
};
export type MultipleFilter = {
  htmlProps?: MultiSelectProps;
  multiSelectProps: MultiSelectProps;
  type: 'select-multiple';
};
export type AsyncFilter = {
  type: 'select-async';
};
export type BooleanColumnFilter = {
  placeholder?: string;
  type: 'boolean';
};
export type StandartColumnFilter = {
  type: 'string' | 'number' | 'date';
};
export type valueType<T> = {
  value: T;
};
interface IFilterColumnProps {
  column: ColumnFilter;
  setFilteredColumns: Dispatch<React.SetStateAction<ColumnFilter[]>>;
}

export default function FilterColumn({
  column,
  setFilteredColumns,
}: IFilterColumnProps) {
  const [filteredValue, setFilteredValue] = useState<string>(column.value);
  const [isDropdownOpen, setIsDropdownOpen] = useState(!column.value);
  const [selectedRows, setSelectedRows] = useState<unknown[]>([]);
  useEffect(() => {
    if (column.type === 'boolean') {
      setFilteredValue(column.value ? 'true' : 'false');
      return;
    }
    setFilteredValue(column.value);
  }, [column.value]);

  function handleSave() {
    if (!filteredValue && column.type !== 'boolean') {
      handleDelete();
      return;
    }

    setFilteredColumns((val) => {
      const temp = [...val];
      const index = temp.findIndex((item) => item.name === column.name);
      temp[index] = { ...temp[index], value: filteredValue };
      return temp;
    });
    setIsDropdownOpen(false);
  }
  function handleDelete() {
    setFilteredColumns((val) => {
      const index = val.findIndex((item) => item.name === column.name);
      val.splice(index, 1);
      const temp = [...val];
      return temp;
    });
    setIsDropdownOpen(false);
  }
  function handleOpenChange(open: boolean) {
    if (!open && !filteredValue) {
      handleDelete();
    }
    setIsDropdownOpen(open);
  }
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  return (
    <>
      <CustomTableActionDialog
        type="Sheet"
        action={{
          cta: 'Submit',
          description: 'Submit',
          loadingContent: <div>Loading...</div>,
          type: 'Sheet',
          componentType: 'CustomComponent',
          content: (
            <>
              Async Filter {filteredValue}
              selected Rows{' '}
              {selectedRows.map((row) => {
                if (row && typeof row === 'object' && 'email' in row)
                  return row.email;
                return row;
              })}
              <DataTable
                columnsData={{
                  type: 'Auto',
                  data: {
                    ...autoColumnData,
                    selectable: true,
                    onSelect(row) {
                      if (!row) return;
                      setSelectedRows([...selectedRows, row]);
                      setFilteredValue(
                        [...selectedRows, row]
                          .map((row) => {
                            if (
                              row &&
                              typeof row === 'object' &&
                              'email' in row
                            )
                              return row.email;
                            return row;
                          })
                          .join(',')
                      );
                      console.log(row);
                    },
                  },
                }}
                showView={false}
                rowCount={data.length}
                data={data}
              />
              <Button
                onClick={() => {
                  handleSave();
                }}
              >
                Save
              </Button>
            </>
          ),
        }}
        open={isDialogOpen}
        onOpenChange={(state) => {
          setIsDialogOpen(state);
          setIsDropdownOpen(state);
          handleOpenChange(state);
        }}
      />
      <DropdownMenu
        open={isDropdownOpen}
        onOpenChange={(open) => {
          handleOpenChange(open);
        }}
      >
        {column.value !== '' ? (
          <div className="border px-3 py-1 border-gray-300 rounded-full text-xs mr-2 flex justify-center">
            <DropdownMenuTrigger>
              <span className="font-semibold">{column.displayName}</span>:{' '}
              {column.type === 'date'
                ? column.value
                  ? new Date(column.value).toLocaleDateString()
                  : ''
                : column.value}
            </DropdownMenuTrigger>
            <Button
              variant="ghost"
              className="p-0 ml-2 h-auto"
              onClick={() => handleDelete()}
            >
              <Cross1Icon className="size-3" />
            </Button>
          </div>
        ) : (
          <DropdownMenuTrigger />
        )}

        <DropdownMenuContent className="sm:max-w-md p-2">
          <div className="flex flex-row justify-between items-center mb-2">
            <Label htmlFor="name">{column.displayName}</Label>
            <Button variant="ghost" onClick={() => handleDelete()}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-row items-center gap-2 justify-center mb-2">
            <GenerateFilterByType
              column={column}
              setFilteredValue={setFilteredValue}
              filteredValue={filteredValue}
              openDialog={(open) => {
                setIsDropdownOpen(open);
                setIsDialogOpen(!open);
              }}
            />
          </div>
          <Button
            variant="secondary"
            onClick={() => handleSave()}
            className="w-full"
          >
            Filtrele
          </Button>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

function GenerateFilterByType({
  column,
  setFilteredValue,
  filteredValue,
  openDialog,
}: {
  column: ColumnFilter;
  filteredValue: string;
  openDialog: (open: boolean) => void;
  setFilteredValue: Dispatch<React.SetStateAction<string>>;
}) {
  const columnType = column.type;
  switch (columnType) {
    case 'string':
    case 'number':
      return (
        <Input
          id="name"
          className="col-span-3"
          onChange={(e) => {
            setFilteredValue(e.target.value);
          }}
          value={filteredValue}
          type={column.type === 'number' ? 'number' : 'text'}
          autoComplete="off"
        />
      );
    case 'date':
      return (
        <AdvancedCalendar
          initialFocus
          mode="single"
          onSelect={(value) => {
            setFilteredValue(value?.toISOString() || '');
          }}
          selected={filteredValue ? new Date(filteredValue) : undefined}
        />
      );
    case 'select':
      return (
        <Select onValueChange={(value) => setFilteredValue(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={column.placeholder} />
          </SelectTrigger>
          <SelectContent>
            {column.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    case 'boolean':
      return (
        <div className="flex items-center space-x-2">
          <Switch
            id={`${column.name}_filter`}
            defaultChecked={
              column.value === '' ? false : column.value === 'true'
            }
            onCheckedChange={(value) =>
              setFilteredValue(value ? 'true' : 'false')
            }
          />
          {column.placeholder && (
            <Label htmlFor={`${column.name}_filter`}>
              {column.placeholder}
            </Label>
          )}
        </div>
      );
    case 'select-multiple': {
      const defaultValue = [...filteredValue.split(',')];
      return (
        <MultiSelect
          {...column.multiSelectProps}
          {...column.htmlProps}
          defaultValue={defaultValue}
          onValueChange={(value) => {
            if (value.length === 0) {
              return;
            }
            setFilteredValue(value.toString());
          }}
        />
      );
    }
    case 'select-async': {
      openDialog(false);
      break;
    }
    default: {
      const exhaustiveCheck: never = columnType;
      throw new Error(`Unhandled filter case: ${exhaustiveCheck}`);
    }
  }
}
