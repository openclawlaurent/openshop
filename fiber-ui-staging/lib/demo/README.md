# Demo Data for Activity Page

This directory contains demo/mock data for testing the activity page UI with various transaction states and crypto types.

## Using Demo Data

To enable demo data in the activity page:

1. Open `app/(authenticated)/activity/page.tsx`
2. Uncomment the import line:
   ```typescript
   import { DEMO_ACTIVITY_TRANSACTIONS } from "@/lib/demo/activity-demo-data";
   ```
3. Uncomment the demo data line:
   ```typescript
   transactions = DEMO_ACTIVITY_TRANSACTIONS;
   ```

To disable demo data, simply comment out those lines again.

## Demo Data Includes

The demo data (`DEMO_ACTIVITY_TRANSACTIONS`) contains 8 transactions showcasing:

### Transaction States

- **Completed (3 transactions)**: Full flow with confirmed step1 and step2 blockchain transactions
- **Ready (1 transaction)**: Step 1 complete, step 2 in progress
- **Pending (3 transactions)**: Step 1 in progress or just started
- **Failed (1 transaction)**: Transaction that failed during processing

### Crypto Types

- **FIN**: Primary reward token
- **LFIN**: Locked FIN (shown during pending state)
- **BONK**: Partner token example
- **USDC**: Stablecoin example
- **SOL**: Native Solana token example

### Blockchain Transaction States

- **CONFIRMED**: Transaction successful on blockchain
- **PROCESSING**: Transaction being processed
- **QUEUED**: Transaction waiting to be processed
- **INITIALIZED**: Transaction created but not started
- **FAILED**: Transaction failed with error message

### Test Cases Included

1. **Amazon ($125)** - Completed with FIN + BONK
2. **Target ($75.50)** - Completed with FIN + USDC
3. **Walmart ($200)** - Ready status, step 2 processing
4. **Best Buy ($499.99)** - Pending with step 1 processing
5. **Nike ($149.99)** - Pending with multiple cryptos (LFIN + SOL)
6. **Apple Store ($999)** - Pending with no blockchain transactions yet
7. **Whole Foods ($85)** - Completed with 4 different cryptos (tests expand button)
8. **Home Depot ($350)** - Failed transaction with error message

### Expected Stats from Demo Data

When using the demo data, the activity stats should show:

- **Total Earnings**:
  - 1,387.50 FIN
  - 857,778 BONK
  - 8.03 USDC
  - 0.025 SOL
  - 3 completed offers

- **Pending Earnings**:
  - 5,462.50 LFIN
  - 0.05 SOL
  - 4 pending merchant confirmation

## Notes

- All transaction hashes and wallet addresses in the demo data are fake/example values
- The demo data is type-safe and matches the `CashbackTransactionUI` interface
- Demo data includes both recent transactions (hours ago) and older ones (days/weeks ago)
- Perfect for testing the UI without needing a database connection
