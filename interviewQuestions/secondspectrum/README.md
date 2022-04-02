# data process

终端运行

```bash
npm i && npm run start
```

Find the stock with the largest absolute increase from its first recording to its last recording and print it. This is complicated by the file being unsorted, and having lots of null values, with non-standard null entries (unknown, NA, N/A, UNKOWN, etc).

example1:

```bash
Name,Date,notes,Value,Change
IQZ,2015-7-8,notes,656.36,INCREASED
DLV,2015-8-8,notes,173.35,INCREASED
DLV,2015-10-4,notes,231.67,INCREASED
DLV,2015-9-7,notes,209.57,DECREASED
IQZ,2015-9-7,notes,641.23,DECREASED
IQZ,2015-10-4,notes,657.32,INCREASED
DLV,2015-8-18,notes,233.43,INCREASED
DLV,2015-9-15,notes,158.73,DECREASED
IQZ,2015-10-8,notes,537.53,DECREASED
IQZ,2015-10-6,notes,Invalid,UNKNOWN

Print: 公司: DLV, 股价增值: 58.320000
```

example1:

```bash
Name,Date,notes,Value,Change
IQZ,2015-7-8,notes,656.36,DECREASED
DLV,2015-8-8,notes,773.35,DECREASED
DLV,2015-10-4,notes,231.67,DECREASED
DLV,2015-9-7,notes,299.57,DECREASED

Print: nil
```
