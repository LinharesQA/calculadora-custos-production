const express = require('express');
const { Roll } = require('../models');
const { authenticateToken, validateInput, checkOwnership, auditLog } = require('../middleware/auth');

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// Validação para bobinas
const rollValidation = {
  name: { required: true, type: 'string', minLength: 2, maxLength: 100 },
  width: { required: true, type: 'number', min: 0.1, max: 999.99 }
};

// Listar todas as bobinas do usuário
router.get('/', auditLog('rolls_list'), async (req, res) => {
  try {
    const rolls = await Roll.findAll({
      where: { 
        user_id: req.user.id,
        is_active: true 
      },
      order: [['name', 'ASC']],
      attributes: ['id', 'name', 'width', 'created_at', 'updated_at']
    });

    const rollsData = rolls.map(roll => ({
      id: roll.id,
      name: roll.name,
      width: parseFloat(roll.width),
      createdAt: roll.created_at,
      updatedAt: roll.updated_at
    }));

    res.json({
      success: true,
      rolls: rollsData,
      total: rollsData.length
    });
    
  } catch (error) {
    console.error('Erro ao listar bobinas:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Buscar bobina específica
router.get('/:id', checkOwnership('Roll'), async (req, res) => {
  try {
    const roll = req.resource;

    res.json({
      success: true,
      roll: {
        id: roll.id,
        name: roll.name,
        width: parseFloat(roll.width),
        createdAt: roll.created_at,
        updatedAt: roll.updated_at
      }
    });
    
  } catch (error) {
    console.error('Erro ao buscar bobina:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Criar nova bobina
router.post('/', validateInput(rollValidation), auditLog('roll_create'), async (req, res) => {
  try {
    const { name, width } = req.body;

    // Verificar se já existe bobina com mesmo nome para o usuário
    const existingRoll = await Roll.findOne({
      where: {
        user_id: req.user.id,
        name: name.trim(),
        is_active: true
      }
    });

    if (existingRoll) {
      return res.status(400).json({
        error: 'Já existe uma bobina com este nome'
      });
    }

    const roll = await Roll.create({
      user_id: req.user.id,
      name: name.trim(),
      width: parseFloat(width)
    });

    res.status(201).json({
      success: true,
      message: 'Bobina criada com sucesso',
      roll: {
        id: roll.id,
        name: roll.name,
        width: parseFloat(roll.width),
        createdAt: roll.created_at
      }
    });
    
  } catch (error) {
    console.error('Erro ao criar bobina:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Atualizar bobina
router.put('/:id', 
  checkOwnership('Roll'),
  validateInput(rollValidation),
  auditLog('roll_update'),
  async (req, res) => {
    try {
      const { name, width } = req.body;
      const roll = req.resource;

      // Verificar se já existe outra bobina com mesmo nome
      const existingRoll = await Roll.findOne({
        where: {
          user_id: req.user.id,
          name: name.trim(),
          is_active: true,
          id: { [require('sequelize').Op.ne]: roll.id }
        }
      });

      if (existingRoll) {
        return res.status(400).json({
          error: 'Já existe outra bobina com este nome'
        });
      }

      await roll.update({
        name: name.trim(),
        width: parseFloat(width)
      });

      res.json({
        success: true,
        message: 'Bobina atualizada com sucesso',
        roll: {
          id: roll.id,
          name: roll.name,
          width: parseFloat(roll.width),
          updatedAt: roll.updated_at
        }
      });
      
    } catch (error) {
      console.error('Erro ao atualizar bobina:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }
);

// Deletar bobina (soft delete)
router.delete('/:id', 
  checkOwnership('Roll'),
  auditLog('roll_delete'),
  async (req, res) => {
    try {
      const roll = req.resource;

      await roll.update({
        is_active: false
      });

      res.json({
        success: true,
        message: 'Bobina removida com sucesso'
      });
      
    } catch (error) {
      console.error('Erro ao deletar bobina:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }
);

// Estatísticas das bobinas
router.get('/stats/overview', auditLog('rolls_stats'), async (req, res) => {
  try {
    const rolls = await Roll.findAll({
      where: { 
        user_id: req.user.id,
        is_active: true 
      },
      attributes: ['name', 'width']
    });

    const stats = {
      total: rolls.length,
      averageWidth: 0,
      largestWidth: 0,
      smallestWidth: 0,
      widthDistribution: {}
    };

    if (rolls.length > 0) {
      const widths = rolls.map(roll => parseFloat(roll.width));
      
      stats.averageWidth = widths.reduce((sum, width) => sum + width, 0) / widths.length;
      stats.largestWidth = Math.max(...widths);
      stats.smallestWidth = Math.min(...widths);

      // Distribuição por faixas de largura
      const ranges = [
        { min: 0, max: 21, label: 'Pequena (0-21 cm)' },
        { min: 21, max: 42, label: 'Média (21-42 cm)' },
        { min: 42, max: 60, label: 'Grande (42-60 cm)' },
        { min: 60, max: Infinity, label: 'Extra Grande (>60 cm)' }
      ];

      ranges.forEach(range => {
        const count = widths.filter(width => width >= range.min && width < range.max).length;
        stats.widthDistribution[range.label] = count;
      });
    }

    res.json({
      success: true,
      stats
    });
    
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
