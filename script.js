webix.ready(function () {
  var stock = [
    { id: 1, title: 'Ручка', quantity: 5, cost: 10 },
    { id: 2, title: 'Тетрадь', quantity: 5, cost: 30 },
    { id: 3, title: 'Блокнот', quantity: 5, cost: 20 },
    { id: 4, title: 'Папка', quantity: 5, cost: 100 },
    { id: 5, title: 'Скоросшиватель', quantity: 5, cost: 200 },
  ];

  var basket = [];

  var summary = [{ id: "sum", title: "Сумма", value: 0 }];

  webix.ui({
    rows: [
      {
        cols: [
          // Show modal window
          {
            view:"toolbar",
            id:"top_toolbar",
            elements: [
              { },
              { view:"button", id:"new_product_button", value:"Новый товар", width: 200,
              click:function(){
                $$("add_window").show();
              }}
            ]
          },
          // Summary
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
          // Stock datatable
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
            ],
            on: {
              onItemClick: function () {
                transfer($$("stock"), $$("basket"), $$("stock").getSelectedItem());
              }
            }
          },
          // Basket datatable
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
            ],
            on: {
              onItemClick: function () {
                transfer($$("basket"), $$("stock"), $$("basket").getSelectedId());
              }
            }
          },
        ],
      },
    ]
  });

  // Modal window

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
        {
          view:"icon", icon:"wxi-close", click: function() {
            $$("add_window").hide();
          }
        }
      ]    
    },
    body: {
      rows: [
        // Form
        { 
          view:"form",
          id:"add_form",
          width: 300,
          elementsConfig:{ labelPosition: "top", bottomPadding: 18 },
          elements:[
            { view:"text", name:"title", id:"input_title", label:"Наименование",
                invalidMessage: "Введите наименование товара" },
            { view:"text", name:"quantity", id:"input_quantity", label:"Количество",
                invalidMessage: "Введите количество товара (число) " },
            { view:"text", name:"cost", id:"input_cost", label:"Цена",
                invalidMessage: "Введите стоимость товара (число)" }
          ],
          rules:{
            "title":webix.rules.isNotEmpty,
            "quantity":webix.rules.isNotEmpty,
            "cost":webix.rules.isNotEmpty,
            "quantity":webix.rules.isNumber,
            "cost":webix.rules.isNumber,
          },
        },
        // Add button
        {
          view:"button", id:"add_product", value:"Добавить",
          click: function() {
            if ($$("add_form").validate()) {
              addToStock($$("add_form").getValues());
              refresh();
              $$("add_form").clear();
              $$("add_window").hide();
            }
          }
        },
      ]
    }
  });

  // Functions

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

  function addTo(toStorage, item) {
    if (toStorage.exists(item.id)) {
      toStorage.getItem(item.id).quantity++;
    } else {
      toStorage.add({ id: item.id, title: item.title, quantity: 1, cost: item.cost });
    }
    $$("summary").getItem("sum").value = 0;
    $$("basket").data.each(function (item) {
      $$("summary").getItem("sum").value += item.cost * item.quantity;
    });
  }

  function addToStock(item) {
    for (let i = 1; i <= $$("stock").count(); i++) {
      if ($$("stock").getItem(i).title === item.title &&
          $$("stock").getItem(i).cost === Number(item.cost)) {
        $$("stock").getItem(i).quantity += Number(item.quantity);
        return;
      };
    }
    $$("stock").add(item);
  }

  function refresh() {
    $$("stock").refresh();
    $$("basket").refresh();
    $$("summary").refresh();
  }
});
