webix.ready(function () {
   
  class Product {
    constructor(id, title, quantity, cost) {
      this.id = id;
      this.title = title;
      this.quantity = quantity;
      this.cost = cost;
    }
  }

  var stock = [
    { id: 1, title: 'Ручка', quantity: 5, cost: 10 },
    { id: 2, title: 'Тетрадь', quantity: 5, cost: 30 },
    { id: 3, title: 'Блокнот', quantity: 5, cost: 20 },
    { id: 4, title: 'Папка', quantity: 5, cost: 100 },
    { id: 5, title: 'Скоросшиватель', quantity: 5, cost: 200 },
  ];

  var basket = [];

  var summary = [ { id: "sum", title: "Сумма", value: 0 } ];

  // Отображение таблиц "Корзина-Склад"
  webix.ui({
    rows: [
      {
        cols: [
          // Тулбар с кнопкой "Новый товар", при нажатии на которую открывается
          // окно с формой добавления нового товара
          {
            view:"toolbar",
            id:"top_toolbar",
            elements: [
              { },
              { view:"button", id:"new_product_button", value:"Новый товар", width: 200 }
            ]
          },
          // Показ суммы стоимости товаров, находящихся в корзине
          {
            view: "list",
            id: "summary",
            data: summary,
            template: "#title#: #value#"
          }
        ]
      },
      {
        cols: [
          // Таблица с данными "Склад"
          {
            view: "datatable",
            id: "stock",
            select: true,
            autoConfig: true,
            data: stock,
            columns: [
              { id: "title", header: "Название", fillspace: true },
              { id: "quantity", header: "Количество", width: 100 },
              { id: "cost", header: "Цена", width: 100 },
            ]
          },
          // Таблица с данными "Корзина"
          {
            view: "datatable",
            id: "basket",
            select: true,
            autoConfig: true,
            data: basket,
            columns: [
                { id: "title", header: "Название", fillspace: true },
                { id: "quantity", header: "Количество", width: 100 },
                { id: "cost", header: "Цена", width: 100 },
            ]
          }
        ]
      }
    ]
  });

  // Модальное окно с формой добавления нового товара
  webix.ui({
    view:"window",
    id: "add_window",
    modal: true,
    width: 500,
    position: "center",
    head: {
      view:"toolbar", elements:[
        {
          template: "Добавление нового товара"
        },
        // Кнопка закрытия формы добавления нового товара,
        // при нажатии на которую очищаются поля формы
        {
          view:"icon", id: "close_form_button", icon:"wxi-close"
        }
      ]    
    },
    body: {
      rows: [
        // Форма добавления нового товара
        { 
          view:"form",
          id:"add_form",
          width: 400,
          elementsConfig:{ labelPosition: "top", bottomPadding: 18 },
          elements:[
            { view:"text", name:"title", id:"input_title", label:"Наименование",
                invalidMessage: "Введите наименование товара" },
            { view:"text", name:"quantity", id:"input_quantity", label:"Количество",
                invalidMessage: "Введите количество товара (число больше ноля) " },
            { view:"text", name:"cost", id:"input_cost", label:"Цена",
                invalidMessage: "Введите стоимость товара (число больше ноля)" }
          ],
          // Правила валидации данных в форме
          rules:{
            title:webix.rules.isNotEmpty,
            quantity:function(value) { return parseFloat(value) == value && value > 0; },
            cost:function(value) { return parseFloat(value) == value && value >= 0; }
          },
        },
        // Кнопка добавления данных нового товара из формы в таблицу "Склад",
        // но если данные не прошли валидацию, появятся сообщения об ошибках
        {
          view:"button", id:"add_product", value:"Добавить"
        },
      ]
    }
  });

  // Обработка нажатия на строку товара в таблице "Склад"
  $$("stock").attachEvent("onItemClick", function () {
    transfer($$("stock"), $$("basket"), $$("stock").getSelectedItem());
  });

  // Обработка нажатия на строку товара в таблице "Корзина"
  $$("basket").attachEvent("onItemClick", function () {
    transfer($$("basket"), $$("stock"), $$("basket").getSelectedId());
  });

  // Обработка нажатия на кнопку "Новый товар"
  $$("new_product_button").attachEvent("onItemClick", function() {
    $$("add_window").show();
  });

  // Обработка нажатия на кнопку закрытия формы добавления нового товара
  $$("close_form_button").attachEvent("onItemClick", function() {
    $$("add_form").clear();
    $$("add_form").clearValidation();
    $$("add_window").hide();
  });

  // Обработка нажатия на кнопу "Добавить" в окне добавления нового товара
  $$("add_product").attachEvent("onItemClick", function() {
    if ($$("add_form").validate()) {
      addToStock($$("add_form").getValues());
      refresh();
      $$("add_form").clear();
      $$("add_window").hide();
    }
  });

  // Функция перемещения товаров из одной таблицы в другую
  function transfer(fromStorage, toStorage, product) {
    if (fromStorage.exists(product.id)) {
      fromStorage.getItem(product.id).quantity--;
      addTo(toStorage, fromStorage.getItem(product.id));
      if (fromStorage.getItem(product.id).quantity <= 0) {
        fromStorage.remove(product.id);
      }
    }
    refresh();
  }

  // Функция проверки наличия подобного товара в таблице
  function addTo(toStorage, item) {
    // если подобный товар есть в таблице, увеличивается его количество
    if (toStorage.exists(item.id)) {
      toStorage.getItem(item.id).quantity++;
    }
    // если подобного товара нет в таблице, добавляется новая строка с этим товаром
    else {
      toStorage.add(new Product(item.id, item.title, 1, item.cost));
    }
    // подсчет суммы товаров в корзине
    $$("summary").getItem("sum").value = 0;
    $$("basket").data.each(function (item) {
      $$("summary").getItem("sum").value += item.cost * item.quantity;
    });
  }

  // Функция добавления нового товара из формы в таблицу "Склад"
  function addToStock(item) {
    // переменная для проверки наличия товара в таблице
    let count = 0;
    // если в таблице "Склад" есть товар с такими же именем и ценой, как у добавляемого,
    // количество товара в таблице увеличивается на количество, переданное из формы...
    $$("stock").data.each(function(product) {
      if (product.title.toLowerCase() === item.title.toLowerCase() &&
          product.cost === Number(item.cost)) {
        product.quantity += Number(item.quantity);
        count++;
      };
    });
    // ...и происходит выход из функции
    if (count) {
      return;
    // если такого же товара нет в таблице "Склад", проверяется
    // наличие этого товара в таблице "Корзина"
    } else {
      $$("basket").data.each(function(product) {
        // если такой же товар есть в таблице "Корзина", в таблицу "Склад" добавляется новая
        // строка с данными товара из формы и id такого же товара из таблицы "Корзина"...
        if (product.title.toLowerCase() === item.title.toLowerCase() &&
            product.cost === Number(item.cost)) {
          $$("stock").add(new Product(product.id, item.title,
            Number(item.quantity), Number(item.cost)));
            count++;
          }
      });
      // ... и происходит выход из функции
      if (count) {
        return;
      }
      // если подобный товар есть в таблице "Корзина", в таблицу "Склад" добавляются
      // данные товара из формы и id такого же товара из таблицы "Корзина"
      else {
        $$("stock").add(new Product($$("stock").count() + 1, item.title,
            Number(item.quantity), Number(item.cost)));
      }
    }
  }

  // Функция обновления данных в таблицах и строки с суммой
  function refresh() {
    $$("stock").refresh();
    $$("basket").refresh();
    $$("summary").refresh();
  }
});
