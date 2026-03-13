import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userMessage = body.message?.toLowerCase() || "";

    // Simulated network delay
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));

    let aiReply = "I am the SmartLease Assistant. Feel free to ask me about rent-to-own, our properties, or how the technology works under the hood!";

    // Simple pattern matching for "Intelligent" Mock-AI
    if (userMessage.includes("hello") || userMessage.includes("hi")) {
      aiReply = "Hello! Welcome to SmartLease. How can I help you today?";
    } else if (userMessage.includes("rent to own") || userMessage.includes("how does it work")) {
      aiReply = "With Rent-to-Own, you pay rent dynamically every second you live in the property. A portion of your rent accumulates towards equity. Once you reach 100% equity, the ownership of the house (represented as a PropertyToken NFT) automatically transfers to you! You can stop renting at any time.";
    } else if (userMessage.includes("token") || userMessage.includes("nft")) {
      aiReply = "The SmartLease platform uses ERC-721 PropertyTokens. Each house on the platform is tokenized on the blockchain. When a tenant completes their payment schedule, the smart contract automatically transfers this token to their wallet, making them the verifiable owner.";
    } else if (userMessage.includes("pay") || userMessage.includes("money") || userMessage.includes("usdc")) {
      aiReply = "SmartLease utilizes MockERC20 tokens (which acts like a stablecoin like USDC) to pay for rent. Rent is processed through our RentPaymaster contract which calculates the exact seconds you stayed in the property and deductions are handled transparently.";
    } else if (userMessage.includes("identity") || userMessage.includes("kyc")) {
      aiReply = "We use an IdentityRegistry smart contract. Landlords and tenants both have to be registered and verified before they can create a lease or move into a property. This ensures complete trust on the platform.";
    } else if (userMessage.includes("landlord")) {
      aiReply = "Landlords can list their properties using the Dashboard. They receive recurring rent and can track the accumulated equity of their tenants. It's fully automated by smart contracts.";
    } else if (userMessage.includes("tenant")) {
      aiReply = "Tenants browse available properties, sign a digital Rent-to-Own lease, and pay per second. They can monitor their growing equity directly from their Tenant Dashboard.";
    } else if (userMessage.includes("scaffold") || userMessage.includes("technology")) {
      aiReply = "This application is built using Scaffold-ETH 2 and Next.js. It interacts directly with our customized solidity smart contracts running on the EVM! So cool, right?";
    } else if (userMessage.includes("who are you") || userMessage.includes("what are you")) {
      aiReply = "I am the SmartLease Assistant chatbot! I'm here to help users understand the platform logistics and smart contract architecture. What would you like to know?";
    } else if (userMessage.includes("accessibility") || userMessage.includes("blind")) {
      aiReply = "SmartLease cares deeply about accessibility! You can use our accessibility widget (the blue icon on the right) to increase font sizes, toggle high-contrast mode, or even have text read aloud to you.";
    }

    return NextResponse.json({ reply: aiReply });
  } catch (error) {
    console.error("Chat API error: ", error);
    return NextResponse.json(
      { error: "Failed to process chat request." },
      { status: 500 }
    );
  }
}