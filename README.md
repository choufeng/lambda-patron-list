# lambda-patron-list
客户（代理商）列表

## Method

GET

## Headers

|key|value|
|---|---|
|Content-Type|application/json|
|Authorization| Bearer *|

## Out Data

|key|type|
|---|---|
|result| bool(true, false)|
|message|string|
|data|list|

## Process

1. checkToken
2. checkAdminRole
3. getDataFromDB
4. returnDataList


