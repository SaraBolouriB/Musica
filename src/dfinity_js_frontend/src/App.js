import React, { useEffect, useCallback, useState } from "react";
import { Container, Nav } from "react-bootstrap";
import Musics from "./components/marketplace/Musics";
import "./App.css";
import Wallet from "./components/Wallet";
import { logout as destroy } from "./utils/auth";
import { isAuthenticated, getPrincipalText } from "./utils/auth";
import { tokenBalance} from "./utils/icrc2_ledger";
import { icpBalance } from "./utils/ledger";
import { getAddressFromPrincipal } from "./utils/marketplace";

const App = function AppWrapper() {
  const [authenticated, setAuthenticated] = useState(false);
  const [principal, setPrincipal] = useState('');
  const [icrcBalance, setICRCBalance] = useState('');
  const [balance, setICPBalance] = useState('');
  const [address, setAddress] = useState('');
  const symbol = 'ICP';

  const getICRCBalance = useCallback(async () => {
    if (authenticated) {
      setICRCBalance(await tokenBalance());
    }
  });

  const getICPBalance = useCallback(async () => {
    if (authenticated) {
      setICPBalance(await icpBalance());
    }
  });

  useEffect(async () => {
    setAuthenticated(await isAuthenticated());
  }, [setAuthenticated]);

  useEffect(async () => {
    const principal = await getPrincipalText();
    setPrincipal(principal);
  }, [setPrincipal]);

  useEffect(async () => {
    const principal = await getPrincipalText();
    const account = await getAddressFromPrincipal(principal);
    setAddress(account.account);
  }, [setAddress]);

  useEffect(() => {
    getICRCBalance();
  }, [getICRCBalance]);

  useEffect(() => {
    getICPBalance();
  }, [getICPBalance]);

  return (
    <Container fluid="md">
      <Nav className="justify-content-end pt-3 pb-5">
        <Nav.Item>
          <Wallet
            address={address}
            principal={principal}
            icpBalance={balance}
            icrcBalance={icrcBalance}
            symbol={symbol}
            isAuthenticated={authenticated}
            destroy={destroy}
          />
        </Nav.Item>
      </Nav>
      <main>
        <Musics tokenSymbol={symbol} />
      </main>
    </Container>
  );
};

export default App;
