import React, { useState, useEffect } from 'react';
import Web3 from 'web3';

declare global {
  interface Window {
    ethereum: any;
  }
}

function Metamask() {
  const [accounts, setAccounts] = useState<string[]>([]);
  const [balances, setBalances] = useState<string[]>([]);

  useEffect(() => {
    const getAccounts = async () => {
      // Metamask가 설치되어 있는지 확인
      if (!window.ethereum) {
        alert('Please install Metamask first.');
        return;
      }

      try {
        // web3 객체 생성
        const web3 = new Web3(window.ethereum);

        // 연결된 계정 정보 가져오기
        const accounts = await web3.eth.getAccounts();
        setAccounts(accounts);
        console.log("accounts : ",accounts);

        // 연결된 모든 네트워크의 코인 개수 가져오기
        const balances = await Promise.all(accounts.map(async (account) => {
          const balance = await web3.eth.getBalance(account);
          return web3.utils.fromWei(balance, 'ether');
        }));
        setBalances(balances);
      } catch (error) {
        alert('Failed to connect to Metamask.');
        console.error(error);
      }
    };
    getAccounts();
  }, []);

  return (
    <div>
      <h1>Metamask 연결된 계정 정보</h1>
      <ul>
        {accounts.map((account, index) => (
          <li key={index}>
            계정: {account}, 코인 개수: {balances[index]}
          </li>
        ))}
      </ul>
    </div>
  );


}

export default Metamask;
