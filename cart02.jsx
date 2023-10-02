
const Cart = (props) => {
    const { Card, Accordion, Button } = ReactBootstrap;
    let data = props.location.data ? props.location.data : [];
    console.log(`data:${JSON.stringify(data)}`);
  
    return <Accordion defaultActiveKey="0">{list}</Accordion>;
  };
  
  const useDataApi = (initialUrl, initialData) => {
    const { useState, useEffect, useReducer } = React;
    const [url, setUrl] = useState(initialUrl);
  
    const [state, dispatch] = useReducer(dataFetchReducer, {
      isLoading: false,
      isError: false,
      data: initialData,
    });
    console.log(`useDataApi called`);
    useEffect(() => {
      console.log("useEffect Called");
      let didCancel = false;
      const fetchData = async () => {
        dispatch({ type: "FETCH_INIT" });
        try {
          const result = await axios(url);
          console.log("FETCH FROM URl");
          if (!didCancel) {
            dispatch({ type: "FETCH_SUCCESS", payload: result.data });
          }
        } catch (error) {
          if (!didCancel) {
            dispatch({ type: "FETCH_FAILURE" });
          }
        }
      };
      fetchData();
      return () => {
        didCancel = true;
      };
    }, [url]);
    return [state, setUrl];
  };
  
  const dataFetchReducer = (state, action) => {
    switch (action.type) {
      case "FETCH_INIT":
        return {
          ...state,
          isLoading: true,
          isError: false,
        };
      case "FETCH_SUCCESS":
        return {
          ...state,
          isLoading: false,
          isError: false,
          data: action.payload,
        };
      case "FETCH_FAILURE":
        return {
          ...state,
          isLoading: false,
          isError: true,
        };
      default:
        throw new Error();
    }
  };
  
  const Products = (props) => {
    const { useState, useEffect } = React;
    const [cart, setCart] = useState([]);
    const [total, setTotal] = useState(0);
    const { Card, Accordion, Button, Container, Row, Col, Image, Input } = ReactBootstrap;
  
    const [query, setQuery] = useState("http://localhost:1337/api/products");
    const [items, setItems] = useState([]);  // New state for products
  
    useEffect(() => {
      const fetchData = async () => {
        try {
          const result = await axios(query);
          if (result.data && result.data.data) {
            setItems(result.data.data);
          }
        } catch (error) {
          console.error("Error fetching the products", error);
        }
      };
      fetchData();
    }, [query]);
  
    const addToCart = (e) => {
      e.stopPropagation();
      let name = e.target.name;
      let itemToAdd = items.find((item) => item.attributes.name === name);
      if (itemToAdd && itemToAdd.attributes.instock > 0) {
        setItems(prevItems => 
          prevItems.map(item => 
            item.attributes.name === name 
            ? { ...item, attributes: { ...item.attributes, instock: item.attributes.instock - 1 } }
            : item
          )
        );
        setCart([...cart, itemToAdd]);
      } else {
        console.error(`Item not found or out of stock: ${name}`);
      }
    };
  
    const deleteCartItem = (index) => {
      let newCart = cart.filter((item, i) => index !== i);
      setCart(newCart);
    };
  
    let list = items.map((item, index) => {
      let url = `https://picsum.photos/id/${index + 10}/70/70`;
      return (
        <li key={index}>
          <Image src={url} width={70} roundedCircle></Image>
          <Button variant="primary" size="large">
            {item.attributes.name}:{item.attributes.cost}
          </Button>
          <input name={item.attributes.name} type="submit" onClick={addToCart}></input>
        </li>
      );
    });
  
    // ... (rest of the code remains unchanged)
  
    const restockProducts = async (url) => {
      try {
        const result = await axios(url);
        if (result.data && result.data.data) {
          setItems(prevItems => [...prevItems, ...result.data.data]);
        } else {
          console.error("Invalid data from the backend");
        }
      } catch (error) {
        console.error("Error fetching the products", error);
      }
    };
  
    return (
      // ... (rest of the JSX remains unchanged)
      <Row>
        <form
          onSubmit={(event) => {
            restockProducts(query);
            console.log(`Restock called on ${query}`);
            event.preventDefault();
          }}
        >
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button type="submit">ReStock Products</button>
        </form>
      </Row>
      // ...
    );
  };
  
  ReactDOM.render(<Products />, document.getElementById("root"));