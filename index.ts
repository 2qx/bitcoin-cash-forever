

import { Contract, ElectrumNetworkProvider } from 'cashscript';
import { compileString } from "cashc";
import { TransactionDetails } from 'cashscript/dist/module/interfaces';

import { perpetuityContract } from "./perpetuity.ts"
import { derivePublicKeyHash } from "./util.ts"


export async function getContract(isTestnet:boolean, period: number, address:string, allowance:number, decay:number): Promise<Contract> {
  

  // Compile the Faucet contract
  let script = compileString(perpetuityContract)

  // Initialise a network provider for network operations

  const provider = isTestnet ? new ElectrumNetworkProvider('staging') : new ElectrumNetworkProvider('mainnet');

  let recipientPkh = derivePublicKeyHash(address)
  let contract =  new Contract(script, [period, recipientPkh, allowance, decay], provider);
  console.log(`# Perpetuity to pay 1/${decay} total, every ${period} blocks, after a ${allowance} (sat) executor allowance`)
  console.log('contract address:          ', contract.address);
  console.log("contract principal:        ", await contract.getBalance());
  return contract

}

export async function execute(isTestnet:boolean, address:string, period: number, allowance:number, decay:number, executorAddress?:string, feeOverride?:number): Promise<TransactionDetails> {
  
  let contract = await getContract(isTestnet, period, address, allowance, decay);
  let balance = await contract.getBalance();
  if(balance==0) return 
  let installment = Math.round(balance / decay);
  let fn = contract.functions['execute'];
  
  let newPrincipal = balance - (installment + allowance)

  installment += 1;
  newPrincipal += 1;
  let minerFee = feeOverride ? feeOverride : 152;
  let executorFee = balance - (installment + newPrincipal + minerFee) - 1
  

  console.log("installment:              -", installment )
  console.log("executor fee:             -", executorFee)
  console.log("miner fee:                -", minerFee )
  console.log("=============================================" )
  console.log("next balance:              ", newPrincipal)


  let outputs = [
    { 
        to: address,
        amount: installment
    },
    {
        to: contract.address,
        amount: newPrincipal,
    }
    ]

    if(typeof(executorAddress)==="string") outputs.push(
        { 
            to: executorAddress,
            amount: executorFee
        })

  try{
    let payTx = await fn()
        .to(outputs)
        .withAge(period)
        .withoutChange()
        .send();
        return payTx
    }catch(e){
        throw(e)
    }



}



