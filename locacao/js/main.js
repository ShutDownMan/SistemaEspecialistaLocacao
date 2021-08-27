$(function () {
	$("#form-register").validate({
		rules: {},
		messages: {
			meses_atrasados: {
				required: "Por favor prover meses de atraso"
			},
			valor_aluguel: {
				required: "Por favor prover valor do aluguel",
				moreThan: "Valor inválido"
			},
			juros_moratorios: {
				required: "Por favor prover juros moratórios"
			},
			multa_moratoria: {
				required: "Por favor prover multa moratória",
			}
		}
	});
	$("#form-total").steps({
		headerTag: "h2",
		bodyTag: "section",
		transitionEffect: "fade",
		// enableAllSteps: true,
		autoFocus: true,
		transitionEffectSpeed: 500,
		titleTemplate: '<div class="title">#title#</div>',
		labels: {
			previous: 'Back',
			next: '<i class="zmdi zmdi-arrow-right"></i>',
			finish: '<i class="zmdi zmdi-arrow-right"></i>',
			current: ''
		},
		onStepChanging: function (event, currentIndex, newIndex) {
			let meses_atrasados = (new Date()).getTime() - new Date($('#meses_atrasados').val()).getTime();
			let valor_aluguel = Number($('#valor_aluguel').val());
			let juros_moratorios = Number($('#juros_moratorios').val());
			let multa_moratoria = Number($('#multa_moratoria').val());
			let valor_benfeitoria = Number($('#valor_benfeitoria').val());
			let renda_valor = Number($('#renda_valor').val());
			let igpm = 1;
			let divida_nova = 0;
			let abusividade_juros = "";
			let abusividade_multa = "";

			meses_atrasados = new Date(meses_atrasados).getMonth() + 1;
			console.log(meses_atrasados, valor_aluguel, juros_moratorios, multa_moratoria);

			divida = calc_divida(meses_atrasados, valor_aluguel, juros_moratorios, multa_moratoria, igpm);
			console.log(divida);

			[abusividade_juros, juros_moratorios] = checka_abusividade_juros(juros_moratorios);
			[abusividade_multa, multa_moratoria] = checka_abusividade_multa(multa_moratoria);

			benfeitoria = (valor_benfeitoria) ? "Descontado valor das benfeitorias necessárias" : "Não considerando benfeitorias necessárias";

			divida_nova = calc_divida(meses_atrasados, valor_aluguel, juros_moratorios, multa_moratoria, igpm);

			divida_proposta = divida_nova - valor_benfeitoria;

			[parcelamento_recomendado, parcelamentos_opcionais] = parcelas(divida_proposta, renda_valor);

			$('#divida-val').text('R$ ' + divida.toFixed(2));
			$('#abusividade_juros-val').text(abusividade_juros);
			$('#abusividade_multa-val').text(abusividade_multa);
			$('#benfeitoria-val').text(benfeitoria);
			$('#divida_proposta-val').text('R$ ' + divida_proposta.toFixed(2));
			$('#parcelamento_recomendado-val').text(parcelamento_recomendado);
			$('#parcelamentos_opcionais-val').text(parcelamentos_opcionais);

			$("#form-register").validate().settings.ignore = ":disabled,:hidden";
			return $("#form-register").valid();
		}
	});
	function calc_divida(meses, aluguel, juros, multa, igpm) {
		let divida = 0;
		let aluguel_multa = aluguel + (aluguel * (multa / 100) * igpm);
		for (let i = 0; i < meses; i++) {
			divida += aluguel_multa + (aluguel_multa * (juros / 100) * i);
		}
		return divida;
	}

	function checka_abusividade_juros(juros) {
		if (juros > 1) {
			return ["Detectado abusividade nos juros ajustando para 1%", 1];
		} else {
			return ["Não detectado abusividade nos juros", juros];
		}
	}

	function checka_abusividade_multa(multa) {
		if (multa > 10) {
			return ["Detectado abusividade na multa, ajustando para 10%", 10];
		} else {
			return ["Não detectado abusividade na multa", multa];
		}
	}

	function propor_divida(divida, valor_benfeitoria) {
		return divida - valor_benfeitoria;
	}

	function mais_proximo(parcela_array, num) {
		var curr = parcela_array[0];
		var diff = Math.abs(num - curr);
		for (var i = 0; i < parcela_array.length; i++) {
			var newdiff = Math.abs(num - parcela_array[i]);
			if (newdiff < diff) {
				diff = newdiff;
				curr = parcela_array[i];
			}
		}
		return curr;
	}

	function checa_pos_parcela(parcela_array, num) {

		for (var i = 0; i < parcela_array.length; i++) {
			if (parcela_array[i] === num) {
				return i;
			}
		}

	}

	function no_renda(parcela) {
		return "Renda é 0 ou muito baixa para calcular melhor parcela, apresentando parcelas padrões."
			+ "Parcelagem 1: (2x) R$ " + parcela[0].toFixed(2)
			+ "Parcelagem 2: (6x) R$ " + parcela[4].toFixed(2)
			+ "Parcelagem 3: (12x) R$ " + parcela[10].toFixed(2);
	}

	function parcelas(divida, renda) {
		var parcela = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		parcela[0] = divida / 2;
		parcela[1] = divida / 3;
		parcela[2] = divida / 4;
		parcela[3] = divida / 5;
		parcela[4] = divida / 6;
		parcela[5] = divida / 7;
		parcela[6] = divida / 8;
		parcela[7] = divida / 9;
		parcela[8] = divida / 10;
		parcela[9] = divida / 11;
		parcela[10] = divida / 12;

		if (renda === 0) {
			return no_renda(parcela);
		}

		let faixa = 0;
		if (renda >= 0 && renda <= 1903, 98) faixa = 1;
		else if (renda >= 1903.99 && renda <= 2826.65) faixa = 2;
		else if (renda >= 2826.66 && renda <= 3751.05) faixa = 3;
		else if (renda >= 3751.06 && renda <= 4664.68) faixa = 4;
		else if (renda >= 4664.69) faixa = 5;

		let renda_array = [0, 0, 0]
		renda_array[0] = renda * 0.15;
		renda_array[1] = renda * 0.2;
		renda_array[2] = renda * 0.3;

		let flag1, flag2, flag3 = 0;

		let renda15 = mais_proximo(parcela, renda_array[0]);
		if (renda15 === 0) flag1 = 1;
		let renda15_pos = checa_pos_parcela(parcela, renda15);
		renda15_pos += 2;
		let renda20 = mais_proximo(parcela, renda_array[1]);
		if (renda20 === 0) flag2 = 1;
		let renda20_pos = checa_pos_parcela(parcela, renda20);
		renda20_pos += 2;
		let renda30 = mais_proximo(parcela, renda_array[2]);
		if (renda30 === 0) flag3 = 1;
		let renda30_pos = checa_pos_parcela(parcela, renda30);
		renda30_pos += 2;

		if (faixa === 1 || faixa === 2) {
			if (flag1 === 1) {
				no_renda(parcela);
				return;
			}

			let recomendada = "Parcelagem recomendada: " + "(" + renda15_pos + "x) R$ " + renda15.toFixed(2);
			let opcional = "";
			if (renda15 !== renda20) {
				opcional += "Parcelagem opcional: " + "(" + renda20_pos + "x) R$ " + renda20.toFixed(2) + " | ";
			}
			if (renda20 !== renda30) {
				opcional += "Parcelagem opcional: " + "(" + renda30_pos + "x) R$" + renda30.toFixed(2) + " | ";
			}

			return [recomendada, opcional];

		} else if (faixa === 3 || faixa === 4) {
			if (flag2 === 1) {
				return no_renda(parcela);
			}

			let recomendada = "Parcelagem recomendada: " + "(" + renda20_pos + "x) R$" + renda20.toFixed(2);
			let opcional = "";
			if (renda15 !== renda20) {
				opcional += "Parcelagem opcional: " + "(" + renda15_pos + "x) R$" + renda15.toFixed(2) + " | ";
			}
			if (renda20 !== renda30) {
				opcional += "Parcelagem opcional: " + "(" + renda30_pos + "x) R$" + renda30.toFixed(2) + " | ";
			}

			return [recomendada, opcional];

		} else if (faixa === 5) {
			if (flag3 === 1) {
				no_renda(parcela);
				return;
			}
			let recomendada = "Parcelagem recomendada: " + "(" + renda30_pos + "x) R$ " + renda30.toFixed(2) + "\n";
			let opcional = "";
			if (renda20 !== renda30) {
				opcional += "Parcelagem opcional: " + "(" + renda20_pos + "x) R$ " + renda20.toFixed(2) + "\n";
			}
			if (renda15 !== renda20) {
				opcional += "Parcelagem opcional: " + "(" + renda15_pos + "x) R$ " + renda15.toFixed(2) + "\n";
			}

			return [recomendada, opcional];
		}

	}

});
