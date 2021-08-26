# PancakeSwap Info site v2

Analytics for tokens and pools.

## Project structure

```
src
│
└───components            # Specific react components (generic ones come from UIKit)
└───config                # Constants and initializations
└───contexts              # React context (just localization and theme, actual data is in Redux)
└───data
│   │
│   └───pools             # Queries for pools
│   |
│   └───protocol          # Queries for home page
│   │
│   └───search            # Queries for search
│   |
│   └───tokens            # Queries for tokens
│
└───hooks                 # React hooks
│
└───state                 # Redux state
│
└───style                 # Globl style
│
└───types                 # Types that are reused across many files
│
└───utils                 # Helper functions
│
└───views                 # Pages of website
```

## To Start Development

###### Installing dependencies

```bash
yarn
```

###### Running locally

```bash
yarn start
```
