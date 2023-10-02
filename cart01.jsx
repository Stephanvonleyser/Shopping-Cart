// simulate getting products from DataBase
//comented products since we get them from Strapi DB
/* const products = [
  { name: "Apples_:", country: "Italy", cost: 3, instock: 10 },
  { name: "Oranges:", country: "Spain", cost: 4, instock: 3 },
  { name: "Beans__:", country: "USA", cost: 2, instock: 5 },
  { name: "Cabbage:", country: "USA", cost: 1, instock: 8 },
]; */
//=========Cart=============
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
  const { useState } = React;
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const { Card, Accordion, Button, Container, Row, Col, Image, Input } = ReactBootstrap;

  const [query, setQuery] = useState("http://localhost:1337/api/products");
  const [{ data, isLoading, isError }, doFetch] = useDataApi(
    "http://localhost:1337/api/products",
    { data: [] }
  );
  
  const items = data && data.data ? data.data : [];
  console.log(`Rendering Products ${JSON.stringify(data)}`);

  const addToCart = (e) => {
    e.stopPropagation();
    let name = e.target.name;
    let itemToAdd = items.find((item) => item.attributes.name === name);

    if (itemToAdd && itemToAdd.attributes.instock > 0) {
      const newItems = items.map(item => 
        item.attributes.name === name 
        ? { ...item, attributes: { ...item.attributes, instock: item.attributes.instock - 1 } }
        : item
      );

      doFetch(query); // Updating to fetch the modified data

      setCart([...cart, itemToAdd]);
    } else {
      console.error(`Item not found or out of stock: ${name}`);
    }
    console.log("Adding to cart:", name, itemToAdd);
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
  
  let cartList = cart.map((item, index) => {
    return (
      <Card key={index}>
        <Card.Header>
          <Accordion.Toggle as={Button} variant="link" eventKey={1 + index}>
            {item.attributes.name}
          </Accordion.Toggle>
        </Card.Header>
        <Accordion.Collapse
          onClick={() => deleteCartItem(index)}
          eventKey={1 + index}
        >
          <Card.Body>
            $ {item.attributes.cost} from {item.attributes.country}
          </Card.Body>
        </Accordion.Collapse>
      </Card>
    );
  });

  let finalList = () => {
    let costs = cart.map((item) => item.attributes.cost);
    let newTotal = costs.reduce((acc, curr) => acc + curr, 0);
    let final = cart.map((item, index) => {
        return (
            <div key={index} index={index}>
                {item.attributes.name}
            </div>
        );
    });
    return { final, total: newTotal };
};

const checkOut = () => {
    setTotal(finalList().total);
};

const restockProducts = async (url) => {
  try {
    const result = await axios(url);
    if (result.data && result.data.data) {
      // Update the products list using the doFetch function
      doFetch(url);
    } else {
      console.error("Invalid data from the backend");
    }
  } catch (error) {
    console.error("Error fetching the products", error);
  }
};

  return (
    <Container>
      <Row>
        <Col>
          <h1>Product List</h1>
          <ul style={{ listStyleType: "none" }}>{list}</ul>
        </Col>
        <Col>
          <h1>Cart Contents</h1>
          <Accordion>{cartList}</Accordion>
        </Col>
        <Col>
          <h1>CheckOut </h1>
          <Button onClick={checkOut}>CheckOut $ {finalList().total}</Button>
          <div> {finalList().total > 0 && finalList().final} </div>
        </Col>
      </Row>
      <Row>
        <form
          onSubmit={(event) => {
            restockProducts(`${query}`);
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
    </Container>
  );
};
// ========================================
ReactDOM.render(<Products />, document.getElementById("root"));
