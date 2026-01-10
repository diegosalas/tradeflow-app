import Dashboard from './pages/Dashboard';
import TradeAssistant from './pages/TradeAssistant';
import TradeDetail from './pages/TradeDetail';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "TradeAssistant": TradeAssistant,
    "TradeDetail": TradeDetail,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};