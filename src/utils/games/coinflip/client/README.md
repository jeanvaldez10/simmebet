# Coinflip API Integration Guide

## Easy API Connection

The coinflip game is **already set up** to easily connect to a real API! Here's how:

### Quick Switch to Real API

1. **Open** `src/hooks/games/coinflip/useGameState.ts`
2. **Change** line 15:
   ```typescript
   const USE_MOCK_API = false; // Change from true to false
   ```
3. **Done!** The game will now use the real API.

### API Endpoints Required

The game expects these endpoints:

#### GET `/api/games/coinflip/current`
- Returns current game state
- Response format:
  ```json
  {
    "success": true,
    "gameState": {
      "id": "game_123",
      "status": "idle",
      "player": null,
      "opponent": null,
      "result": null,
      "createdAt": 1234567890,
      "updatedAt": 1234567890
    },
    "availableActions": [
      {
        "action": "FLIP",
        "description": "Start the coin flip"
      }
    ]
  }
  ```

#### POST `/api/games/coinflip/current`
- Sends a game action
- Request body:
  ```json
  {
    "action": "FLIP",
    "betAmount": 10,
    "side": "heads",
    "state": { /* current game state */ }
  }
  ```
- Response format: Same as GET endpoint

### What's Already Done

✅ API service file created (`gameApiService.ts`)  
✅ Type-safe interfaces defined  
✅ Error handling implemented  
✅ Loading states managed  
✅ Easy mock/real API switching  
✅ Initial state fetching on mount  

### Next Steps

1. Create the API route at `/app/(site)/api/games/coinflip/current/route.ts`
2. Implement the backend logic for each action
3. Set `USE_MOCK_API = false` in `useGameState.ts`
4. Test the integration

The structure matches blackjack's API pattern, so you can use it as a reference!

