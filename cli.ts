#!/usr/bin/env -S npx ts-node --esm

import {Cli, Command, Builtins, Option} from 'clipanion';
import { isOptionSymbol } from 'clipanion/lib/advanced/options';
import {execute, getContract} from "./index.ts";


class BitcoinForever extends Command {
  static paths = [Command.Default];


  isTestnet = Option.Boolean('--testnet',false, {description: "Use testnet, defaults to 12.5% each block"})
  getAddress = Option.Boolean('--deposit',false, {description: "give the deposit address for the contract and exit"} )

  address = Option.String('--address', {required: true, description: "recieving cash address to send coins to, i.e. beneficiary address"});
  period = Option.String('--period', {required: false, description: "how often (in blocks) the contract pays (default: 4000, about monthly)"});
  allowance = Option.String('--allowance', {required: false, description: "the executor's allowance for miner fees & adminstration (default: 3400 sats)"});
  decay = Option.String('--decay', {required: false, description: "the divisor for the fraction taking in each installment (default: 120, i.e. 1/120 or 0.83% each installment)"});
  executorAddress = Option.String('--exAddress', {required: false, description: "address for fee taken by executor for submitting transaction"});
  fee = Option.String('--fee', {required: false, description: "transaction fee override"});

  async execute() {
    console.warn("Alpha Software. DON'T PUT YOUR LIFE SAVINGS ON THIS CONTRACT!!! ")
    const defaultPeriod = this.isTestnet ? 1 : 4000;
    const defaultDecay = this.isTestnet ? 8 : 120;
    let periodInt = !this.period ? defaultPeriod : parseInt(this.period) ;
    let allowanceInt = !this.allowance ? 3400: parseInt(this.allowance) ;
    let decayInt = !this.decay ? defaultDecay: parseInt(this.decay) ;
    let feeOverride = !this.fee ? undefined : parseInt(this.fee) ;


    if(!this.getAddress){
       await execute(this.isTestnet, this.address, periodInt, allowanceInt, decayInt, this.executorAddress, feeOverride)
    }else{
        await getContract(this.isTestnet, periodInt, this.address,  allowanceInt, decayInt)
    }
  }
}

const cli = new Cli({
  binaryName: 'bitcoin-cash-forever',
  binaryLabel: 'bitcoin-cash-forever',
  binaryVersion: '0.0.1'
});

cli.register(BitcoinForever);
cli.register(Builtins.VersionCommand);
cli.register(Builtins.HelpCommand);

cli.runExit(process.argv.slice(2));