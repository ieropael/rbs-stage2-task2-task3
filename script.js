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
            {
                cols: [
                    {},
                    {
                        view: "list",
                        id: "summary",
                        data: summary,
                        template: "#title#: #value#"
                    }
                ]
            }

        ]

    });
    function transfer(fromStorage, toStorage, good) {
        if (fromStorage.exists(good.id)) {
            fromStorage.getItem(good.id).quantity--;
            addTo(toStorage, fromStorage.getItem(good.id));
            if (fromStorage.getItem(good.id).quantity <= 0) {
                fromStorage.remove(good.id);
            }
        }
        fromStorage.refresh();
        toStorage.refresh();
        $$("summary").refresh();
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
});
