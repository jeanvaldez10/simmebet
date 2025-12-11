# Adrian Flex Card Notes

## Cash Out Modal

- Cash out modal relies on **Net USDC Invested** to get your original bet
- Sometimes Net USDC shows 0 which causes bet amount to show 0
- We use a snapshot of usdc invested before we process the transaction since netusdc would be 0 after the transaction completes but we still need to show the value on the flex card
- I removed belief % from cash out modal since we would need to calculate what their INITIAL bet belief was. In the other cases we take the current market belief.

## Update Bet & Share Positions Flex

Make one flex card type to handle sharing an ongoing bet position. When updating an existing bet instead of showing the flex card we currently do we can show this new flex type we are making. Lets also make sharing on positions on profile use this same flex type instead of flex10

Make a markdown file to plan this update with the details of how it will work and what it will show. When updating a bet we should ensure that we are updating to the latest values so we can calculate as if we were generating this from the profile screen after the bet was updated.

## Completed Tasks

- Fixed categories
- Profile flex card (simplifed)
- added `flexCardGenerator.ts`
- show amount won as total payout instead of profits
- Use square market images on flex cards
- add flex type on dev environment for debugging
- Fixed profile position ongoing sharing (flex15)
- Fixed update bet to use ongoing combined flex card (flex15)

## TODO

- I need to test the normal place bet flex card

## Notes

- We need to not show profits on the flex cards we should just show the amount it would be worth when they cash out.
- How will LP impact our flex calculations if they have active positions
